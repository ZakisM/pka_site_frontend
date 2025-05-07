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

async fn deserialize_and_serialize<T>(
    bytes: &[u8],
    decode_type_name: &str,
) -> Result<JsValue, JsValue>
where
    T: for<'a> Decode<'a> + Serialize,
{
    let mut reader = ZstdDecoder::new(bytes);
    let mut decompressed_bytes = Vec::with_capacity(bytes.len()); // Pre-allocate for potential efficiency

    reader
        .read_to_end(&mut decompressed_bytes)
        .await
        .map_err(|e| {
            JsValue::from_str(&format!("Failed to decompress {}: {}", decode_type_name, e))
        })?;

    let items: Vec<T> = bitcode::decode(&decompressed_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to decode {}: {}", decode_type_name, e)))?;

    serde_wasm_bindgen::to_value(&items)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize {}: {}", decode_type_name, e)))
}

#[wasm_bindgen]
pub async fn deserialize_episodes(bytes: &[u8]) -> Result<JsValue, JsValue> {
    deserialize_and_serialize::<PkaEpisodeSearchResult>(bytes, "episodes").await
}

#[wasm_bindgen]
pub async fn deserialize_events(bytes: &[u8]) -> Result<JsValue, JsValue> {
    deserialize_and_serialize::<PkaEventSearchResult>(bytes, "events").await
}
