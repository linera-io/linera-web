use wasm_bindgen::prelude::*;
use web_sys::*;
#[macro_use]
mod util;

use anyhow::anyhow;

fn test_wasmi() -> anyhow::Result<()> {
    use wasmi::*;

    // First step is to create the Wasm execution engine with some config.
    // In this example we are using the default configuration.
    let engine = Engine::new(Config::default().consume_fuel(true));
    let wat = r#"
        (module
            (import "host" "hello" (func $host_hello (param i32)))
            (func (export "hello")
                (call $host_hello (i32.const 3))
            )
        )
    "#;
    // Wasmi does not yet support parsing `.wat` so we have to convert
    // out `.wat` into `.wasm` before we compile and validate it.
    let wasm = wat::parse_str(&wat)?;
    let module = Module::new(&engine, &mut &wasm[..])?;

    // All Wasm objects operate within the context of a `Store`.
    // Each `Store` has a type parameter to store host-specific data,
    // which in this case we are using `42` for.
    type HostState = u32;
    let mut store = Store::new(&engine, 42);
    let host_hello = Func::wrap(&mut store, |caller: Caller<'_, HostState>, param: i32| {
        log!("Got {param} from WebAssembly");
        log!("My host state is: {}", caller.data());
    });

    // In order to create Wasm module instances and link their imports
    // and exports we require a `Linker`.
    let mut linker = <Linker<HostState>>::new(&engine);
    // Instantiation of a Wasm module requires defining its imports and then
    // afterwards we can fetch exports by name, as well as asserting the
    // type signature of the function with `get_typed_func`.
    //
    // Also before using an instance created this way we need to start it.
    linker.define("host", "hello", host_hello)?;
    let instance = linker
        .instantiate(&mut store, &module)?
        .start(&mut store)?;
    let hello = instance.get_typed_func::<(), ()>(&store, "hello")?;

    store.add_fuel(1_000_000).map_err(|e| anyhow!("{}", e))?;

    // And finally we can call the wasm!
    hello.call(&mut store, ())?;

    log!("Consumed {:?} fuel", store.fuel_consumed());

    Ok(())
}

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    test_wasmi().unwrap();

    log!("Hello World!");
}
