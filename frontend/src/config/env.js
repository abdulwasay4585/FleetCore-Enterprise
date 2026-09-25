/**
 * FleetCore Enterprise — Runtime Environment Configuration
 * 
 * Centralized resolution of microservice endpoints, WebSocket streams,
 * and external service tokens. Supports zero-configuration localhost defaults
 * as well as containerized, Kubernetes, and serverless production deployments.
 */

const isClient = typeof window !== 'undefined';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isClient ? `${window.location.protocol}//${window.location.hostname}:8081` : 'http://localhost:8081');

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (isClient
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8080/ws/telemetry`
    : 'ws://localhost:8080/ws/telemetry');

export const AI_SIDECAR_URL =
  process.env.NEXT_PUBLIC_AI_SIDECAR_URL ||
  (isClient ? `${window.location.protocol}//${window.location.hostname}:8098` : 'http://localhost:8098');

export const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
