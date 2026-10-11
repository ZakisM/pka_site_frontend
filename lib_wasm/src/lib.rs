use async_compression::futures::bufread::ZstdDecoder;
use bitcode::Decode;
use futures::AsyncReadExt;
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Clone, Decode, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PkaEpisodeSearchResult {
    episode_number: f32,
    upload_date: i64,
    title: String,
    length_seconds: i32,
    video_id: String,
    event_count: i32,
}

// What the API sent before video_id and event_count were appended. Decoded as
// A fallback so this module works against either backend while they deploy.
#[derive(Decode)]
struct PkaEpisodeSearchResultV1 {
    episode_number: f32,
    upload_date: i64,
    title: String,
    length_seconds: i32,
}

// The JS shape: the new fields are absent (undefined) for an older backend.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EpisodeOut {
    episode_number: f32,
    upload_date: i64,
    title: String,
    length_seconds: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    video_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    event_count: Option<i32>,
}

impl From<PkaEpisodeSearchResult> for EpisodeOut {
    fn from(e: PkaEpisodeSearchResult) -> Self {
        Self {
            episode_number: e.episode_number,
            upload_date: e.upload_date,
            title: e.title,
            length_seconds: e.length_seconds,
            video_id: Some(e.video_id),
            event_count: Some(e.event_count),
        }
    }
}

impl From<PkaEpisodeSearchResultV1> for EpisodeOut {
    fn from(e: PkaEpisodeSearchResultV1) -> Self {
        Self {
            episode_number: e.episode_number,
            upload_date: e.upload_date,
            title: e.title,
            length_seconds: e.length_seconds,
            video_id: None,
            event_count: None,
        }
    }
}

#[derive(Clone, Decode, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PkaEventSearchResult {
    episode_number: f32,
    timestamp: i32,
    description: String,
    length_seconds: i32,
    upload_date: i64,
}

async fn decompress(bytes: &[u8], decode_type_name: &str) -> Result<Vec<u8>, JsValue> {
    let mut reader = ZstdDecoder::new(bytes);
    let mut decompressed_bytes = Vec::with_capacity(bytes.len()); // Pre-allocate for potential efficiency

    reader
        .read_to_end(&mut decompressed_bytes)
        .await
        .map_err(|e| {
            JsValue::from_str(&format!("Failed to decompress {}: {}", decode_type_name, e))
        })?;

    Ok(decompressed_bytes)
}

fn to_js<T: Serialize>(items: &T, decode_type_name: &str) -> Result<JsValue, JsValue> {
    serde_wasm_bindgen::to_value(items)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize {}: {}", decode_type_name, e)))
}

#[wasm_bindgen]
pub async fn deserialize_episodes(bytes: &[u8]) -> Result<JsValue, JsValue> {
    let decompressed = decompress(bytes, "episodes").await?;

    let items: Vec<EpisodeOut> = match bitcode::decode::<Vec<PkaEpisodeSearchResult>>(&decompressed) {
        Ok(items) => items.into_iter().map(EpisodeOut::from).collect(),
        Err(_) => bitcode::decode::<Vec<PkaEpisodeSearchResultV1>>(&decompressed)
            .map_err(|e| JsValue::from_str(&format!("Failed to decode episodes: {}", e)))?
            .into_iter()
            .map(EpisodeOut::from)
            .collect(),
    };

    to_js(&items, "episodes")
}

#[wasm_bindgen]
pub async fn deserialize_events(bytes: &[u8]) -> Result<JsValue, JsValue> {
    let decompressed = decompress(bytes, "events").await?;
    let items: Vec<PkaEventSearchResult> = bitcode::decode(&decompressed)
        .map_err(|e| JsValue::from_str(&format!("Failed to decode events: {}", e)))?;

    to_js(&items, "events")
}

#[cfg(test)]
mod tests {
    use super::*;
    use bitcode::Encode;

    #[derive(Encode)]
    struct OldWire {
        episode_number: f32,
        upload_date: i64,
        title: String,
        length_seconds: i32,
    }

    #[derive(Encode)]
    struct NewWire {
        episode_number: f32,
        upload_date: i64,
        title: String,
        length_seconds: i32,
        video_id: String,
        event_count: i32,
    }

    fn old_items() -> Vec<OldWire> {
        (0..800)
            .map(|n| OldWire {
                episode_number: n as f32,
                upload_date: 1_600_000_000 + i64::from(n),
                title: format!("PKA {n} W/ Someone: A Title"),
                length_seconds: 14_000 + n,
            })
            .collect()
    }

    #[test]
    fn test_old_payload_does_not_decode_as_new() {
        let bytes = bitcode::encode(&old_items());

        assert!(bitcode::decode::<Vec<PkaEpisodeSearchResult>>(&bytes).is_err());
        assert_eq!(
            bitcode::decode::<Vec<PkaEpisodeSearchResultV1>>(&bytes).unwrap().len(),
            800
        );
    }

    #[test]
    fn test_new_payload_decodes_with_all_fields() {
        let items = vec![NewWire {
            episode_number: 825.0,
            upload_date: 1_791_637_349,
            title: "PKA 825 W/ Harley: Redemption Of Wings".into(),
            length_seconds: 15_859,
            video_id: "u84Ipi19wpM".into(),
            event_count: 41,
        }];
        let decoded = bitcode::decode::<Vec<PkaEpisodeSearchResult>>(&bitcode::encode(&items)).unwrap();

        assert_eq!(decoded[0].video_id, "u84Ipi19wpM");
        assert_eq!(decoded[0].event_count, 41);
    }
}
