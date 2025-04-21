wasm_project_name := "lib_wasm"
wasm_bindings_out_dir := wasm_project_name + "_out"
wasm_bg_file := wasm_bindings_out_dir / wasm_project_name + "_bg.wasm"

_wasm-build:
  @echo "Building WASM"
  @cd {{wasm_project_name}}; cargo build --release --target=wasm32-unknown-unknown -q

[macos]
wasm-build $AR="/opt/homebrew/opt/llvm/bin/llvm-ar" $CC="/opt/homebrew/opt/llvm/bin/clang": 
  @just _wasm-build

[linux]
[windows]
wasm-build:
  @just _wasm-build

wasm-bindgen: wasm-build
  @echo "Generating TypeScript bindings"
  @cd {{wasm_project_name}}; wasm-bindgen ./target/wasm32-unknown-unknown/release/{{wasm_project_name}}.wasm --out-dir={{wasm_bindings_out_dir}} --target=bundler

wasm-opt: wasm-bindgen
  @echo "Optimizing WASM"
  @cd {{wasm_project_name}}; wasm-opt --enable-bulk-memory-opt -O4 {{wasm_bg_file}} -o {{wasm_bg_file}}

update-wasm-bindgen: wasm-opt
  @echo "Deleting old WASM bindgen"
  @rm -rf src/{{wasm_bindings_out_dir}}
  @echo "Moving WASM bindgen to frontend"
  @mv "{{wasm_project_name}}/{{wasm_bindings_out_dir}}" src/
