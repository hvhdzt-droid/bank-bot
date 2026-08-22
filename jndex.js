const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN) {
  console.error("❌ TOKEN غير موجود في Environment Variables");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ CLIENT_ID غير موجود في Environment Variables");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("فحص البوت"),

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("عرض رصيدك"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("استلام الراتب اليومي"),

  new SlashCommandBuilder()
    .setName("work")
    .setDescription("العمل وكسب المال")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
  try {
    console.log("🔄 تسجيل أوامر البوت...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ تم تسجيل الأوامر");
  } catch (error) {
    console.error("❌ فشل تسجيل الأوامر:", error);
  }
}

client.once("ready", async () => {
  console.log(`✅ البوت يعمل باسم ${client.user.tag}`);
  await registerCommands();
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  if (interaction.commandName === "balance") {
    return interaction.reply("💰 رصيدك الحالي: **1000$**");
  }

  if (interaction.commandName === "daily") {
    return interaction.reply("🎁 استلمت **500$** من الراتب اليومي!");
  }

  if (interaction.commandName === "work") {
    const money = Math.floor(Math.random() * 401) + 100;

    return interaction.reply(
      `💼 اشتغلت وكسبت **${money}$**!`
    );
  }
});

client.login(TOKEN);
