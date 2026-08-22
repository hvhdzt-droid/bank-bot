const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error("❌ تأكد من وجود TOKEN و CLIENT_ID في Environment Variables في Render.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =========================
// 💰 قاعدة بيانات بسيطة
// =========================

const users = new Map();

function getUser(id) {
  if (!users.has(id)) {
    users.set(id, {
      wallet: 1000,
      bank: 0,
      lastDaily: 0,
      lastWork: 0
    });
  }

  return users.get(id);
}

function money(amount) {
  return amount.toLocaleString("en-US");
}

// =========================
// 🎮 الأوامر
// =========================

const commands = [
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("عرض رصيدك"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("استلام المكافأة اليومية"),

  new SlashCommandBuilder()
    .setName("work")
    .setDescription("العمل وكسب المال"),

  new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("إيداع المال في البنك")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("المبلغ")
        .setRequired(true)
        .setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("سحب المال من البنك")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("المبلغ")
        .setRequired(true)
        .setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("pay")
    .setDescription("تحويل المال إلى عضو")
    .addUserOption(option =>
  }
});

client.login(TOKEN);
