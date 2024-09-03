# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container at /app
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app/

# Expose the port that the app runs on
EXPOSE 8000

# Run Gunicorn server with appropriate configuration
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application", "--workers", "3"]
