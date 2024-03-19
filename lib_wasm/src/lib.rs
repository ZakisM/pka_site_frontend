use async_compression::futures::bufread::ZstdDecoder;
use bitcode::Decode;
use futures::AsyncReadExt;
use serde::Serialize;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys::Uint8Array;

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
pub async fn deserialize_episodes(bytes: &[u8]) -> Result<Uint8Array, JsValue> {
    let mut reader = ZstdDecoder::new(bytes);
    let mut decompressed_bytes = Vec::new();

    reader.read_to_end(&mut decompressed_bytes).await.unwrap();

    let events: Vec<PkaEpisodeSearchResult> = bitcode::decode(&decompressed_bytes).unwrap();
    let json_episodes = serde_json::to_vec(&events).unwrap();
    let res = Uint8Array::new_with_length(json_episodes.len().try_into().unwrap());
    res.copy_from(&json_episodes);

    Ok(res)
}

#[wasm_bindgen]
pub async fn deserialize_events(bytes: &[u8]) -> Result<Uint8Array, JsValue> {
    let mut reader = ZstdDecoder::new(bytes);
    let mut decompressed_bytes = Vec::with_capacity(bytes.len());

    reader.read_to_end(&mut decompressed_bytes).await.unwrap();

    let events: Vec<PkaEventSearchResult> = bitcode::decode(&decompressed_bytes).unwrap();
    let json_events = serde_json::to_vec(&events).unwrap();
    let res = Uint8Array::new_with_length(json_events.len().try_into().unwrap());
    res.copy_from(&json_events);

    Ok(res)
}
