use wasm_bindgen::prelude::*;
use web_sys::*;
#[macro_use]
mod util;

use anyhow::anyhow;

fn get_answer() -> anyhow::Result<i32> {
    let module_wat = r#"
    (module
      (type $t0 (func (param i32) (result i32)))
      (func $add_one (export "add_one") (type $t0) (param $p0 i32) (result i32)
        get_local $p0
        i32.const 1
        i32.add))
    "#;

    let mut store = wasmer::Store::default();
    let module = wasmer::Module::new(&store, &module_wat)?;
    // The module doesn't import anything, so we create an empty import object.
    let import_object = wasmer::imports! {};
    let instance = wasmer::Instance::new(&mut store, &module, &import_object)?;

    let add_one = instance.exports.get_function("add_one")?;
    let [wasmer::Value::I32(result)] = *add_one.call(&mut store, &[wasmer::Value::I32(42)])?
        else {
            return Err(anyhow!("oh no"));
        };

    Ok(result)
}

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    log!("The answer is: {}", get_answer().unwrap());
}
