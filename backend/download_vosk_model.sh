#!/bin/bash
# Script to download and extract Vosk model

MODEL_DIR="vosk-model"
MODEL_URL="https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
MODEL_NAME="vosk-model-small-en-us-0.15"

echo "Downloading Vosk model..."
cd "$MODEL_DIR"

if command -v wget &> /dev/null; then
    wget "$MODEL_URL"
elif command -v curl &> /dev/null; then
    curl -L -o "${MODEL_NAME}.zip" "$MODEL_URL"
else
    echo "Error: Neither wget nor curl found. Please install one of them."
    exit 1
fi

echo "Extracting model..."
if command -v unzip &> /dev/null; then
    unzip "${MODEL_NAME}.zip"
    rm "${MODEL_NAME}.zip"
    echo "Model extracted successfully!"
    echo "Model location: $(pwd)/${MODEL_NAME}"
else
    echo "Error: unzip not found. Please install unzip or extract manually."
    exit 1
fi

