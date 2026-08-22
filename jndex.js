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
  console.error("❌ TOKEN أو CLIENT_ID غير موجود في Render.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const users = new Map();

function getUser(id) {
  if (!users.has(id)) {
    users.set(id, {
      wallet: 1000,
      bank: 0,
      daily: 0,
      work: 0
    });
  }

  return users.get(id);
}

function formatMoney(number) {
  return number.toLocaleString("en-US");
}

const commands = [
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("عرض رصيدك"),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("المكافأة اليومية"),

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
    .setDescription("تحويل المال")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("العضو")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("المبلغ")
        .setRequired(true)
        .setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("رمي العملة"),

  new SlashCommandBuilder()
    .setName("dice")
    .setDescription("رمي النرد"),

  new SlashCommandBuilder()
    .setName("rps")
    .setDescription("حجر ورق مقص")
    .addStringOption(option =>
      option
        .setName("choice")
        .setDescription("اختيارك")
        .setRequired(true)
        .addChoices(
          { name: "حجر", value: "rock" },
          { name: "ورق", value: "paper" },
          { name: "مقص", value: "scissors" }
        )
    ),

  new SlashCommandBuilder()
    .setName("slots")
    .setDescription("لعبة السلوتس")
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("قيمة الرهان")
        .setRequired(true)
        .setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("لعبة بلاك جاك")
    .addIntegerOption(option =>
      option
        .setName("bet")
        .setDescription("قيمة الرهان")
        .setRequired(true)
        .setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("قائمة الأغنياء")
].map(command => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("🔄 تسجيل أوامر البوت...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands
      }
    );

    console.log("✅ تم تسجيل الأوامر.");
  } catch (error) {
    console.error("❌ خطأ في تسجيل الأوامر:");
    console.error(error);
  }
}

client.once("ready", () => {
  console.log(`✅ البوت شغال: ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const user = getUser(interaction.user.id);
  const command = interaction.commandName;

  if (command === "balance") {
    const total = user.wallet + user.bank;

    return interaction.reply(
      `💰 **رصيدك**\n\n` +
      `👛 المحفظة: **$${formatMoney(user.wallet)}**\n` +
      `🏦 البنك: **$${formatMoney(user.bank)}**\n` +
      `💵 المجموع: **$${formatMoney(total)}**`
    );
  }

  if (command === "daily") {
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (now - user.daily < cooldown) {
      const remaining = cooldown - (now - user.daily);
      const hours = Math.ceil(remaining / (60 * 60 * 1000));

      return interaction.reply(
        `⏳ استلمت اليومية من قبل.\nارجع بعد **${hours} ساعة**.`
      );
    }

    const reward = Math.floor(Math.random() * 501) + 500;

    user.wallet += reward;
    user.daily = now;

    return interaction.reply(
      `🎁 حصلت على **$${formatMoney(reward)}**!`
    );
  }

  if (command === "work") {
    const now = Date.now();
    const cooldown = 60 * 60 * 1000;

    if (now - user.work < cooldown) {
      const remaining = cooldown - (now - user.work);
      const minutes = Math.ceil(remaining / (60 * 1000));

      return interaction.reply(
        `⏳ انتظر **${minutes} دقيقة** قبل العمل مرة ثانية.`
      );
    }

    const jobs = [
      "👨‍💻 مبرمج",
      "🚗 سائق",
      "👨‍🍳 طباخ",
      "📦 موظف توصيل",
      "🔧 فني"
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const salary = Math.floor(Math.random() * 501) + 250;

    user.wallet += salary;
    user.work = now;

    return interaction.reply(
      `💼 عملت كـ **${job}**\n💵 راتبك: **$${formatMoney(salary)}**`
    );
  }

  if (command === "deposit") {
    const amount = interaction.options.getInteger("amount");

    if (amount > user.wallet) {
      return interaction.reply("❌ ما عندك هذا المبلغ.");
    }

    user.wallet -= amount;
    user.bank += amount;

    return interaction.reply(
      `🏦 تم إيداع **$${formatMoney(amount)}**.`
    );
  }

  if (command === "withdraw") {
    const amount = interaction.options.getInteger("amount");

    if (amount > user.bank) {
      return interaction.reply("❌ ما عندك هذا المبلغ في البنك.");
    }

    user.bank -= amount;
    user.wallet += amount;

    return interaction.reply(
      `💸 تم سحب **$${formatMoney(amount)}**.`
    );
  }

  if (command === "pay") {
    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (target.id === interaction.user.id) {
      return interaction.reply("❌ ما تقدر تحول لنفسك.");
    }

    if (target.bot) {
      return interaction.reply("❌ ما تقدر تحول لبوت.");
    }

    if (amount > user.wallet) {
      return interaction.reply("❌ ما عندك فلوس كافية.");
    }

    const receiver = getUser(target.id);

    user.wallet -= amount;
    receiver.wallet += amount;

    return interaction.reply(
      `💸 تم تحويل **$${formatMoney(amount)}** إلى <@${target.id}>.`
    );
  }

  if (command === "coinflip") {
    const result = Math.random() < 0.5 ? "🪙 صورة" : "🪙 كتابة";

    return interaction.reply(
      `🪙 رميت العملة...\nالنتيجة: **${result}**`
    );
  }

  if (command === "dice") {
    const result = Math.floor(Math.random() * 6) + 1;

    return interaction.reply(
      `🎲 رميت النرد...\nالنتيجة: **${result}**`
    );
  }

  if (command === "rps") {
    const player = interaction.options.getString("choice");

    const choices = ["rock", "paper", "scissors"];
    const botChoice =
      choices[Math.floor(Math.random() * choices.length)];

    const names = {
      rock: "🪨 حجر",
      paper: "📄 ورق",
      scissors: "✂️ مقص"
    };

    let result;

    if (player === botChoice) {
      result = "🤝 تعادل!";
    } else if (
      (player === "rock
