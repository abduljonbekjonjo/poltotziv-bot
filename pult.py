import os
import time
import datetime
import logging
import requests

logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

PULT_TOKEN = os.getenv("PULT_TOKEN", "8759841029:AAH0swsWatnCEbY-8zYbpCuNejIVEElTEtk").strip()
TARGET_TOKEN = os.getenv("TARGET_TOKEN", "8353295893:AAHN_HNz2ebCDpw-B-hgFVBNYfRTlEzXOB4").strip()
ADMIN_IDS = {8297834028, 641941356}

KILLSWITCH_URL = "https://example.com/bot_disabled"

PULT_API = f"https://api.telegram.org/bot{PULT_TOKEN}"
TARGET_API = f"https://api.telegram.org/bot{TARGET_TOKEN}"

session = requests.Session()

def get_target_status():
    try:
        r = session.get(f"{TARGET_API}/getWebhookInfo", timeout=10)
        data = r.json()
        if data.get("ok"):
            url = data.get("result", {}).get("url", "")
            if url:
                return "OFF", url
            else:
                return "ON", ""
        return "UNKNOWN", str(data)
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        return "ERROR", str(e)

def turn_off_target():
    try:
        r = session.post(
            f"{TARGET_API}/setWebhook",
            data={"url": KILLSWITCH_URL, "drop_pending_updates": "false"},
            timeout=10
        )
        data = r.json()
        return data.get("ok", False), data.get("description", "")
    except Exception as e:
        return False, str(e)

def turn_on_target():
    try:
        r = session.post(
            f"{TARGET_API}/deleteWebhook",
            data={"drop_pending_updates": "false"},
            timeout=10
        )
        data = r.json()
        return data.get("ok", False), data.get("description", "")
    except Exception as e:
        return False, str(e)

def build_keyboard():
    return {
        "keyboard": [
            [{"text": "🟢 Botni Yoqish"}, {"text": "🔴 Botni O'chirish"}],
            [{"text": "📊 Hozirgi Holat"}]
        ],
        "resize_keyboard": True
    }

def build_inline_keyboard():
    return {
        "inline_keyboard": [
            [
                {"text": "🟢 Yoqish", "callback_data": "turn_on"},
                {"text": "🔴 O'chirish", "callback_data": "turn_off"}
            ],
            [
                {"text": "🔄 Yangilash", "callback_data": "refresh"}
            ]
        ]
    }

def get_status_text():
    status, _ = get_target_status()
    now_str = datetime.datetime.now().strftime("%H:%M:%S")
    if status == "ON":
        return (
            "🎮 <b>OTZIV BOT MAXFIY PUL TI</b>\n\n"
            "🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n"
            "⚡ <b>Holati:</b> 🟢 <b>YONIQ (Faol)</b>\n"
            "✅ <i>Bot barcha foydalanuvchilar uchun ishlab turibdi.</i>\n\n"
            f"🕒 <i>Tekshirildi: {now_str}</i>"
        )
    elif status == "OFF":
        return (
            "🎮 <b>OTZIV BOT MAXFIY PUL TI</b>\n\n"
            "🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n"
            "⚡ <b>Holati:</b> 🔴 <b>O'CHIQ (To'xtatilgan)</b>\n"
            "⚠️ <i>Bot hech kimga javob bermaydi, butunlay o'chirilgan!</i>\n\n"
            f"🕒 <i>Tekshirildi: {now_str}</i>"
        )
    else:
        return (
            "🎮 <b>OTZIV BOT MAXFIY PUL TI</b>\n\n"
            "🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n"
            f"⚡ <b>Holati:</b> ⚠️ Noma'lum ({status})\n\n"
            f"🕒 <i>Tekshirildi: {now_str}</i>"
        )

def send_message(chat_id, text, reply_markup=None):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        session.post(f"{PULT_API}/sendMessage", json=payload, timeout=10)
    except Exception as e:
        logger.error(f"sendMessage error: {e}")

def edit_message_text(chat_id, message_id, text, reply_markup=None):
    payload = {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        session.post(f"{PULT_API}/editMessageText", json=payload, timeout=10)
    except Exception as e:
        logger.error(f"editMessageText error: {e}")

def answer_callback_query(callback_query_id, text=None):
    payload = {"callback_query_id": callback_query_id}
    if text:
        payload["text"] = text
    try:
        session.post(f"{PULT_API}/answerCallbackQuery", json=payload, timeout=10)
    except Exception as e:
        logger.error(f"answerCallbackQuery error: {e}")

def handle_update(update):
    # Handle Callback Queries (Inline Buttons)
    if "callback_query" in update:
        cq = update["callback_query"]
        cq_id = cq["id"]
        from_user = cq.get("from", {})
        user_id = from_user.get("id")
        chat_id = cq.get("message", {}).get("chat", {}).get("id")
        msg_id = cq.get("message", {}).get("message_id")
        data = cq.get("data")

        if user_id not in ADMIN_IDS:
            answer_callback_query(cq_id, "⛔ Ruxsat yo'q!")
            return

        if data == "turn_on":
            ok, msg = turn_on_target()
            answer_callback_query(cq_id, "🟢 Bot yoqildi!" if ok else f"Xato: {msg}")
        elif data == "turn_off":
            ok, msg = turn_off_target()
            answer_callback_query(cq_id, "🔴 Bot o'chirildi!" if ok else f"Xato: {msg}")
        elif data == "refresh":
            answer_callback_query(cq_id, "🔄 Yangilandi")

        # Update message
        text = get_status_text()
        edit_message_text(chat_id, msg_id, text, reply_markup=build_inline_keyboard())
        return

    # Handle standard messages
    if "message" in update:
        msg = update["message"]
        chat_id = msg.get("chat", {}).get("id")
        user_id = msg.get("from", {}).get("id")
        text = msg.get("text", "").strip()

        if user_id not in ADMIN_IDS:
            # Silently ignore unauthorized users
            logger.warning(f"Unauthorized access attempt from user_id: {user_id}")
            return

        if text in ["/start", "📊 Hozirgi Holat"]:
            msg_text = get_status_text()
            send_message(chat_id, msg_text, reply_markup=build_keyboard())
            send_message(chat_id, "👇 Quyidagi tugmalar orqali boshqaring:", reply_markup=build_inline_keyboard())
        elif text == "🟢 Botni Yoqish":
            ok, err = turn_on_target()
            if ok:
                send_message(chat_id, "🟢 <b>Otziv bot muvaffaqiyatli yoqildi!</b>\nEndi bot barcha foydalanuvchilar uchun ishlamoqda.", reply_markup=build_keyboard())
            else:
                send_message(chat_id, f"❌ Xatolik yuz berdi: {err}", reply_markup=build_keyboard())
        elif text == "🔴 Botni O'chirish":
            ok, err = turn_off_target()
            if ok:
                send_message(chat_id, "🔴 <b>Otziv bot butunlay o'chirildi (to'xtatildi)!</b>\nHozir bot hech kimga javob bermaydi.", reply_markup=build_keyboard())
            else:
                send_message(chat_id, f"❌ Xatolik yuz berdi: {err}", reply_markup=build_keyboard())
        else:
            send_message(chat_id, "Tanlang:", reply_markup=build_keyboard())

def main():
    logger.info("Pult bot ishga tushmoqda...")
    # Clean webhook on pult bot just in case
    try:
        session.post(f"{PULT_API}/deleteWebhook", data={"drop_pending_updates": "true"}, timeout=10)
    except Exception as e:
        logger.warning(f"deleteWebhook failed: {e}")

    offset = None
    logger.info("Pult bot muvaffaqiyatli pollingni boshladi!")
    while True:
        try:
            params = {"timeout": 25}
            if offset is not None:
                params["offset"] = offset

            resp = session.get(f"{PULT_API}/getUpdates", params=params, timeout=35)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("ok"):
                    for update in data.get("result", []):
                        offset = update["update_id"] + 1
                        try:
                            handle_update(update)
                        except Exception as e:
                            logger.error(f"Error handling update: {e}")
            else:
                logger.warning(f"getUpdates returned status {resp.status_code}")
                time.sleep(2)
        except Exception as e:
            logger.error(f"Polling loop error: {e}")
            time.sleep(2)

if __name__ == "__main__":
    main()
