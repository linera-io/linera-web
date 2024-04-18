const GENESIS_CONFIG: &str = r#"
{
  "committee": {
    "validators": [
      {
        "name": "71a469f9952149321ccc2e2fb7c89013795f019bda0b8d0a2565cc14a22d2306",
        "network": {
          "protocol": {
            "Grpc": "ClearText"
          },
          "host": "127.0.0.1",
          "port": 9000
        }
      }
    ]
  },
  "admin_id": "e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65",
  "timestamp": 1713448001948543,
  "chains": [
    [
      "2f1351c55068186aa86c985e9f97fee574737184b046be87de2c8a7256cc2f47",
      "1000000."
    ],
    [
      "98437660add0a507ea23270603dcf82638bb8617757ea7977618514713b5b3db",
      "1000000."
    ],
    [
      "fafa1603c6d5a311aed12bc06cd543c007a070c36aea630f6201e121058bc2fd",
      "1000000."
    ],
    [
      "852af7af7db9d9262eae10649940da06008bb29321daf356b8d04c99baaa1372",
      "1000000."
    ],
    [
      "c5862d23c205bff1e0854af06837d4730aecccf712ca9d2b9ed5188a48195b07",
      "1000000."
    ],
    [
      "480e2c10fab3bcf1e67756f4e646e1a1b88ec73a47e51bdae7d914daf837b138",
      "1000000."
    ],
    [
      "3f6690f34b4709c5b5a73c1bd6678fbda0b69681d5b26e497066b4afa412e263",
      "1000000."
    ],
    [
      "149d7119bd8662b159ae393779d8e90b1c8584412ce10f73183ad30d37461bef",
      "1000000."
    ],
    [
      "a760f53e84dc43426520217b6f150d863ee03aee8ee068e5e685122f9cc29ff4",
      "1000000."
    ],
    [
      "5e6ac37eafa7a6e61f37d60829a202d2a517e26a46045659c35a2f531dd00e0e",
      "1000000."
    ]
  ],
  "policy": {
    "block": "0.",
    "fuel_unit": "0.",
    "read_operation": "0.",
    "write_operation": "0.",
    "byte_read": "0.",
    "byte_written": "0.",
    "byte_stored": "0.",
    "operation": "0.",
    "operation_byte": "0.",
    "message": "0.",
    "message_byte": "0.",
    "maximum_bytes_read_per_block": 18446744073709551615,
    "maximum_bytes_written_per_block": 18446744073709551615
  },
  "network_name": "linera-test-2024-04-18T13:46:41"
}
"#;
