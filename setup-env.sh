#!/bin/bash
# Run this on any new machine after cloning the repo
# Usage: bash setup-env.sh

echo "Setting up .env files..."

cp .env.example .env
cp mobile/.env.example mobile/.env
cp backend/.env.example backend/.env

echo "Done! All .env files created."
