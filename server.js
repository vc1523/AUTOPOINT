const rateLimit = require("express-rate-limit");
const express = require("express"); 
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const bookingLimiter = rateLimit({
    windowMs: 30 * 1000,
    limit: 1,
    message: {
        success: false,
        message: "Подождите 30 секунд перед следующей заявкой"
    },
    standardHeaders: "draft-7",
    legacyHeaders: false
});

app.use("/api/booking", bookingLimiter);
app.use(express.static(__dirname));

app.post("/api/booking", async (req, res) => {
    const { name, phone, service } = req.body;

    if (!name || !phone || !service) {
        return res.status(400).json({
            success: false,
            message: "Заполните все поля"
        });
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^[78]\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({
            success: false,
            message: "Некорректный номер телефона"
        });
    }

    if (!["Диагностика", "Замена масла", "Ремонт ходовой"].includes(service)) {
        return res.status(400).json({
            success: false,
            message: "Неизвестная услуга"
        });
    }

    if (!process.env.BOT_TOKEN || !process.env.CHAT_ID) {
        return res.status(500).json({
            success: false,
            message: "Настройки Telegram не заполнены"
        });
    }

    const text =
        "🚗 Новая заявка AUTOPOINT\n\n" +
        `Имя: ${name}\n` +
        `Телефон: ${phone}\n` +
        `Услуга: ${service}`;

    try {
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: process.env.CHAT_ID,
                    text
                })
            }
        );

        if (!telegramResponse.ok) {
            throw new Error("Telegram не принял сообщение");
        }

        res.json({
            success: true,
            message: "Заявка отправлена!"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Не удалось отправить заявку"
        });
    }
});

app.listen(PORT, () => {
    console.log(`AUTOPOINT запущен: http://localhost:${PORT}`);
});