var PULT_TOKEN = "8759841029:AAH0swsWatnCEbY-8zYbpCuNejIVEElTEtk";
var TARGET_TOKEN = "8353295893:AAHN_HNz2ebCDpw-B-hgFVBNYfRTlEzXOB4";
var ADMIN_IDS = [8297834028, 641941356];
var KILLSWITCH_URL = "https://example.com/bot_disabled";

function doGet(e) {
  return ContentService.createTextOutput("🎮 Otziv Bot Maxfiy Pulti faol (Google Cloud)!");
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("OK");
    }
    
    var update = JSON.parse(e.postData.contents);
    
    if (update.callback_query) {
      var cq = update.callback_query;
      var fromId = cq.from.id;
      if (ADMIN_IDS.indexOf(fromId) === -1) {
        answerCallback(cq.id, "⛔ Ruxsat yo'q!");
        return ContentService.createTextOutput("OK");
      }
      
      if (cq.data === "turn_on") {
        turnOnTarget();
        answerCallback(cq.id, "🟢 Bot yoqildi!");
      } else if (cq.data === "turn_off") {
        turnOffTarget();
        answerCallback(cq.id, "🔴 Bot o'chirildi!");
      } else if (cq.data === "refresh") {
        answerCallback(cq.id, "🔄 Yangilandi");
      }
      
      if (cq.message && cq.message.chat) {
        updateMessage(cq.message.chat.id, cq.message.message_id);
      }
      return ContentService.createTextOutput("OK");
    }
    
    if (update.message) {
      var msg = update.message;
      var userId = msg.from ? msg.from.id : null;
      if (ADMIN_IDS.indexOf(userId) === -1) {
        return ContentService.createTextOutput("OK");
      }
      
      var text = (msg.text || "").trim();
      var chatId = msg.chat.id;
      
      if (text === "/start" || text === "📊 Hozirgi Holat") {
        sendStatusMessage(chatId);
      } else if (text === "🟢 Botni Yoqish") {
        turnOnTarget();
        sendMessage(chatId, "🟢 <b>Otziv bot yoqildi!</b>\nBarcha foydalanuvchilar uchun ishlamoqda.");
      } else if (text === "🔴 Botni O'chirish") {
        turnOffTarget();
        sendMessage(chatId, "🔴 <b>Otziv bot to'xtatildi!</b>\nHozir bot hech kimga javob bermaydi.");
      } else {
        sendStatusMessage(chatId);
      }
    }
  } catch (err) {
    Logger.log("Xatolik: " + err);
  }
  return ContentService.createTextOutput("OK");
}

function turnOnTarget() {
  UrlFetchApp.fetch("https://api.telegram.org/bot" + TARGET_TOKEN + "/deleteWebhook?drop_pending_updates=false");
}

function turnOffTarget() {
  UrlFetchApp.fetch("https://api.telegram.org/bot" + TARGET_TOKEN + "/setWebhook?url=" + encodeURIComponent(KILLSWITCH_URL) + "&drop_pending_updates=false");
}

function getTargetStatus() {
  try {
    var resp = UrlFetchApp.fetch("https://api.telegram.org/bot" + TARGET_TOKEN + "/getWebhookInfo");
    var json = JSON.parse(resp.getContentText());
    if (json.ok && json.result.url && json.result.url.length > 0) {
      return "OFF";
    }
    return "ON";
  } catch (e) {
    return "UNKNOWN";
  }
}

function sendStatusMessage(chatId) {
  var status = getTargetStatus();
  var now = Utilities.formatDate(new Date(), "Asia/Tashkent", "HH:mm:ss");
  
  var text = "";
  if (status === "ON") {
    text = "🎮 <b>OTZIV BOT MAXFIY PULTI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🟢 <b>YONIQ (Faol)</b>\n✅ <i>Bot hamma uchun ishlab turibdi.</i>\n\n🕒 <i>" + now + " (Google Cloud 24/7)</i>";
  } else {
    text = "🎮 <b>OTZIV BOT MAXFIY PULTI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🔴 <b>O'CHIQ (To'xtatilgan)</b>\n⚠️ <i>Bot to'xtatilgan!</i>\n\n🕒 <i>" + now + " (Google Cloud 24/7)</i>";
  }
    
  var keyboard = {
    keyboard: [
      [{text: "🟢 Botni Yoqish"}, {text: "🔴 Botni O'chirish"}],
      [{text: "📊 Hozirgi Holat"}]
    ],
    resize_keyboard: true
  };
  
  var inline = {
    inline_keyboard: [
      [{text: "🟢 Yoqish", callback_data: "turn_on"}, {text: "🔴 O'chirish", callback_data: "turn_off"}],
      [{text: "🔄 Yangilash", callback_data: "refresh"}]
    ]
  };
  
  sendMessage(chatId, text, keyboard);
  sendMessage(chatId, "👇 Boshqaruv tugmalari:", inline);
}

function updateMessage(chatId, messageId) {
  var status = getTargetStatus();
  var now = Utilities.formatDate(new Date(), "Asia/Tashkent", "HH:mm:ss");
  
  var text = "";
  if (status === "ON") {
    text = "🎮 <b>OTZIV BOT MAXFIY PULTI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🟢 <b>YONIQ (Faol)</b>\n✅ <i>Bot hamma uchun ishlab turibdi.</i>\n\n🕒 <i>" + now + "</i>";
  } else {
    text = "🎮 <b>OTZIV BOT MAXFIY PULTI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🔴 <b>O'CHIQ (To'xtatilgan)</b>\n⚠️ <i>Bot to'xtatilgan!</i>\n\n🕒 <i>" + now + "</i>";
  }
    
  var inline = {
    inline_keyboard: [
      [{text: "🟢 Yoqish", callback_data: "turn_on"}, {text: "🔴 O'chirish", callback_data: "turn_off"}],
      [{text: "🔄 Yangilash", callback_data: "refresh"}]
    ]
  };
  
  try {
    UrlFetchApp.fetch("https://api.telegram.org/bot" + PULT_TOKEN + "/editMessageText", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: "HTML",
        reply_markup: inline
      })
    });
  } catch (e) {
    Logger.log("editMessage error: " + e);
  }
}

function sendMessage(chatId, text, replyMarkup) {
  var payload = {chat_id: chatId, text: text, parse_mode: "HTML"};
  if (replyMarkup) payload.reply_markup = replyMarkup;
  try {
    UrlFetchApp.fetch("https://api.telegram.org/bot" + PULT_TOKEN + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    });
  } catch (e) {
    Logger.log("sendMessage error: " + e);
  }
}

function answerCallback(cqId, text) {
  try {
    UrlFetchApp.fetch("https://api.telegram.org/bot" + PULT_TOKEN + "/answerCallbackQuery", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({callback_query_id: cqId, text: text})
    });
  } catch (e) {
    Logger.log("answerCallback error: " + e);
  }
}
