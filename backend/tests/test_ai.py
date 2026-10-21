import io


def test_ai_identification_unconfigured_fallback(client):
    # Send a dummy jpeg file
    dummy_image = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 50)
    response = client.post(
        "/api/v1/ai/identify-product",
        files={"image": ("test.jpg", dummy_image, "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["requires_user_confirmation"] is True
    assert "AI Vision provider is not configured" in data["message"] or data["success"] is False


def test_ai_identification_invalid_filetype(client):
    dummy_file = io.BytesIO(b"random text file content")
    response = client.post(
        "/api/v1/ai/identify-product",
        files={"image": ("test.txt", dummy_file, "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported image format" in response.json()["detail"]
