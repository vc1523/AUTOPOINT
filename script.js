const form = document.getElementById("booking-form");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("form-message");

    // Проверка номера телефона
    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^[78]\d{10}$/.test(cleanPhone)) {
        message.textContent = "Введите корректный номер телефона";
        message.style.color = "red";
        return;
    }

    message.style.color = "orange";
    message.textContent = "Отправляем заявку...";

    try {
        const response = await fetch("/api/booking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                service: service
            })
        });

        const result = await response.json();

        // Показываем конкретную ошибку сервера
        if (!response.ok) {
            message.textContent =
                result.message || "Ошибка отправки заявки";
            message.style.color = "red";
            return;
        }

        // Успешная отправка
        message.textContent =
            "Заявка отправлена! Скоро мы свяжемся с вами.";
        message.style.color = "orange";

        form.reset();

    } catch (error) {
        console.error(error);

        message.textContent =
            "Не удалось отправить заявку. Попробуйте позже.";
        message.style.color = "red";
    }
});