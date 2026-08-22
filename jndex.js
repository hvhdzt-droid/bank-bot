const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// أوامر البوت
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("فحص البوت"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("عرض رصيدك"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("استلام راتبك اليومي"),

  new SlashCommandBuilder()
    .setName("work")
    .setDescription("العمل وكسب المال")
].map(command => command.toJSON());

// تسجيل الأوامر
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("جاري تسجيل الأوامر...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("تم تسجيل الأوامر بنجاح ✅");
  } catch (error) {
    console.error(error);
  }
})();

// تشغيل البوت
client.once("ready", () => {
  console.log(`تم تشغيل البوت: ${client.user.tag} ✅`);
});

// استقبال الأوامر
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  if (command === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  if (command === "balance") {
    return interaction.reply("💰 رصيدك: **1000$**");
  }

  if (command === "daily") {
    return interaction.reply("🎁 استلمت راتبك اليومي: **500$**");
  }

  if (command === "work") {
    const money = Math.floor(Math.random() * 500) + 100;

    return interaction.reply(
      💼 اشتغلت وكسبت **${money}$**!
    );
  }
});

client.login(TOKEN);
