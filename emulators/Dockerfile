# Production Dockerfile for FleetCore Enterprise Python AI Sidecar
FROM python:3.11-alpine
WORKDIR /app
COPY stretch_ai_math_service.py .
EXPOSE 8098
ENV PYTHONUNBUFFERED=1
ENV AI_SIDECAR_PORT=8098
USER 1000:1000
ENTRYPOINT ["python", "stretch_ai_math_service.py"]
