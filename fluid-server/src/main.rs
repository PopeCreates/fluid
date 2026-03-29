mod xdr;

mod ai_query;

use axum::{
    routing::{get, post},
    Json, Router,
};
use serde::Serialize;
use std::net::SocketAddr;
use tracing::info;

use ai_query::{handle_ai_query, QueryRequest, QueryFilters};

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

// AI QUERY HANDLER (AXUM STYLE)
async fn ai_query_handler(Json(req): Json<QueryRequest>) -> Json<QueryFilters> {
    let filters = handle_ai_query(req.query);

    Json(filters)
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "fluid_server=info".into()),
        )
        .init();

    // ADD ROUTE HERE
    let app = Router::new()
        .route("/health", get(health))
        .route("/ai/query", post(ai_query_handler));

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3001);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Fluid server (Rust) listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}