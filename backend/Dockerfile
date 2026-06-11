# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Expose port 8000 (informational only)
EXPOSE 8000

# Command to run when container starts.
# Shell form so ${PORT} is expanded — falls back to 8000 locally,
# uses the host-provided port (e.g. Render) when set.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}