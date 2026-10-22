/**
 * 🎮 OTZIV BOT MAXFIY PULTI (24/7 Google Apps Script versiyasi)
 * 
 * Ushbu kodni script.google.com da yangi loyiha ochib qo'yishingiz mumkin.
 * Web App qilib deploy qilib, Webhook bog'lansa noutbuksiz ham 24/7 ishlaydi!
 */

var PULT_TOKEN = "8759841029:AAH0swsWatnCEbY-8zYbpCuNejIVEElTEtk";
var TARGET_TOKEN = "8353295893:AAHN_HNz2ebCDpw-B-hgFVBNYfRTlEzXOB4";
var ADMIN_IDS = [8297834028, 641941356];
var KILLSWITCH_URL = "https://example.com/bot_disabled";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return HtmlService.createHtmlOutput("OK");
    var update = JSON.parse(e.postData.contents);
    
    // Callback query (Inline buttons)
    if (update.callback_query) {
      var cq = update.callback_query;
      var fromId = cq.from.id;
      if (ADMIN_IDS.indexOf(fromId) === -1) {
        answerCallback(cq.id, "⛔ Ruxsat yo'q!");
        return HtmlService.createHtmlOutput("OK");
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
      
      updateMessage(cq.message.chat.id, cq.message.message_id);
      return HtmlService.createHtmlOutput("OK");
    }
    
    // Message
    if (update.message) {
      var msg = update.message;
      var userId = msg.from.id;
      if (ADMIN_IDS.indexOf(userId) === -1) return HtmlService.createHtmlOutput("OK");
      
      var text = msg.text || "";
      if (text === "/start" || text === "📊 Hozirgi Holat") {
        sendStatusMessage(msg.chat.id);
      } else if (text === "🟢 Botni Yoqish") {
        turnOnTarget();
        sendMessage(msg.chat.id, "🟢 <b>Otziv bot muvaffaqiyatli yoqildi!</b>\nBarcha foydalanuvchilar uchun ishlamoqda.");
      } else if (text === "🔴 Botni O'chirish") {
        turnOffTarget();
        sendMessage(msg.chat.id, "🔴 <b>Otziv bot butunlay o'chirildi (to'xtatildi)!</b>\nHozir bot hech kimga javob bermaydi.");
      }
    }
  } catch (err) {
    Logger.log("Error: " + err);
  }
  return HtmlService.createHtmlOutput("OK");
}

function turnOnTarget() {
  UrlFetchApp.fetch("https://api.telegram.org/bot" + TARGET_TOKEN + "/deleteWebhook?drop_pending_updates=false");
}

function turnOffTarget() {
  UrlFetchApp.fetch("https://api.telegram.org/bot" + TARGET_TOKEN + "/setWebhook?url=" + encodeURIComponent(KILLSWITCH_URL) + "&drop_pending_updates=false");
}

function getTargetStatus() {
  var resp = UrlFetchApp.fetch("https://api.telegram.org/bot" + TARGET_TOKEN + "/getWebhookInfo");
  var json = JSON.parse(resp.getContentText());
  if (json.ok && json.result.url && json.result.url.length > 0) {
    return "OFF";
  }
  return "ON";
}

function sendStatusMessage(chatId) {
  var status = getTargetStatus();
  var text = (status === "ON")
    ? "🎮 <b>OTZIV BOT MAXFIY PUL TI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🟢 <b>YONIQ (Faol)</b>\n✅ <i>Bot barcha foydalanuvchilar uchun ishlab turibdi.</i>"
    : "🎮 <b>OTZIV BOT MAXFIY PUL TI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🔴 <b>O'CHIQ (To'xtatilgan)</b>\n⚠️ <i>Bot hech kimga javob bermaydi, butunlay o'chirilgan!</i>";
    
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
  var text = (status === "ON")
    ? "🎮 <b>OTZIV BOT MAXFIY PUL TI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🟢 <b>YONIQ (Faol)</b>\n✅ <i>Bot barcha foydalanuvchilar uchun ishlab turibdi.</i>"
    : "🎮 <b>OTZIV BOT MAXFIY PUL TI</b>\n\n🤖 <b>Boshqarilayotgan bot:</b> @otzivhabib_bot\n⚡ <b>Holati:</b> 🔴 <b>O'CHIQ (To'xtatilgan)</b>\n⚠️ <i>Bot hech kimga javob bermaydi, butunlay o'chirilgan!</i>";
    
  var inline = {
    inline_keyboard: [
      [{text: "🟢 Yoqish", callback_data: "turn_on"}, {text: "🔴 O'chirish", callback_data: "turn_off"}],
      [{text: "🔄 Yangilash", callback_data: "refresh"}]
    ]
  };
  
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
}

function sendMessage(chatId, text, replyMarkup) {
  var payload = {chat_id: chatId, text: text, parse_mode: "HTML"};
  if (replyMarkup) payload.reply_markup = replyMarkup;
  UrlFetchApp.fetch("https://api.telegram.org/bot" + PULT_TOKEN + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}

function answerCallback(cqId, text) {
  UrlFetchApp.fetch("https://api.telegram.org/bot" + PULT_TOKEN + "/answerCallbackQuery", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({callback_query_id: cqId, text: text})
  });
}
