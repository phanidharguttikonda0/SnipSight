fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true)
        .build_client(true)
        .out_dir("src/generated") // every thing goes over here
        .compile_protos(
            &["proto/shortner.proto",
                "proto/file_sharing.proto",
                "proto/payments.proto",
            ],
            &["proto", "proto/include"], // we are including the imports also
        )?;
    Ok(())
}
