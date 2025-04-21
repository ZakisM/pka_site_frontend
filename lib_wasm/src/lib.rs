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

#[wasm_bindgen]
pub async fn deserialize_episodes(bytes: &[u8]) -> Result<JsValue, JsValue> {
    let mut reader = ZstdDecoder::new(bytes);
    let mut decompressed_bytes = Vec::new();

    reader.read_to_end(&mut decompressed_bytes).await.unwrap();

    let episodes: Vec<PkaEpisodeSearchResult> = bitcode::decode(&decompressed_bytes).unwrap();

    let res = serde_wasm_bindgen::to_value(&episodes).unwrap();

    Ok(res)
}

#[wasm_bindgen]
pub async fn deserialize_events(bytes: &[u8]) -> Result<JsValue, JsValue> {
    let mut reader = ZstdDecoder::new(bytes);
    let mut decompressed_bytes = Vec::with_capacity(bytes.len());

    reader.read_to_end(&mut decompressed_bytes).await.unwrap();

    let events: Vec<PkaEventSearchResult> = bitcode::decode(&decompressed_bytes).unwrap();

    let res = serde_wasm_bindgen::to_value(&events).unwrap();

    Ok(res)
}
