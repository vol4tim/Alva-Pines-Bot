import { Markup } from "telegraf";
import bot from "../bot";
import { config } from "../config";
import Profile from "../models/profile";
import { getButtonText, getTranslation } from "../tools/i18n";

async function startAction(ctx) {
  const profile = await Profile.findOne({
    where: { userId: ctx.from.id.toString() }
  });
  const userLang = profile ? profile.language : "ru";
  const buttons = [];
  buttons.push([
    Markup.button.callback(getButtonText(userLang, "activate"), `activate`)
  ]);
  buttons.push([
    Markup.button.callback(getButtonText(userLang, "contact"), `contact`)
  ]);
  buttons.push([
    Markup.button.callback(getButtonText(userLang, "price"), `price`)
  ]);
  // buttons.push([
  //   Markup.button.callback(getButtonText(userLang, "settings"), `settings`)
  // ]);
  await ctx.reply(
    getTranslation(userLang, "welcome"),
    Markup.inlineKeyboard(buttons).resize()
  );
}

async function settingsAction(ctx) {
  const profile = await Profile.findOne({
    where: { userId: ctx.from.id.toString() }
  });
  const userLang = profile ? profile.language : "ru";
  const buttons = [
    [Markup.button.callback("Русский", "set_lang_ru")],
    [Markup.button.callback("English", "set_lang_en")]
  ];
  await ctx.reply(
    getTranslation(userLang, "settings"),
    Markup.inlineKeyboard(buttons).resize()
  );
}

async function setLangAction(ctx, lang = "ru") {
  const profile = await Profile.findOne({
    where: { userId: ctx.from.id.toString() }
  });
  if (profile) {
    await profile.update({ language: lang });
  }
  ctx.reply(getTranslation(lang, "language_set"));
}

export function start() {
  bot.use(async (ctx, next) => {
    const profile = await Profile.findOne({
      where: { userId: ctx.from.id.toString() }
    });
    if (profile === null) {
      await Profile.create({
        userId: ctx.from.id.toString(),
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        language: "ru"
      });
    }
    await next();
  });
  bot.start(async (ctx) => {
    const profile = await Profile.findOne({
      where: { userId: ctx.from.id.toString() }
    });
    if (
      !profile.language ||
      (profile.language === "ru" && !ctx.session.languageSelected)
    ) {
      const buttons = [
        [Markup.button.callback("Русский", "set_lang_ru_start")],
        [Markup.button.callback("English", "set_lang_en_start")]
      ];
      await ctx.reply(
        "Выберите язык / Select language:",
        Markup.inlineKeyboard(buttons).resize()
      );
      ctx.session.languageSelected = true;
    } else {
      await startAction(ctx);
    }
  });

  bot.action("set_lang_ru_start", async (ctx) => {
    await ctx.answerCbQuery();
    await setLangAction(ctx, "ru");
    await startAction(ctx);
  });

  bot.action("set_lang_en_start", async (ctx) => {
    await ctx.answerCbQuery();
    await setLangAction(ctx, "en");
    await startAction(ctx);
  });

  bot.action("activate", async (ctx) => {
    await ctx.answerCbQuery();
    const profile = await Profile.findOne({
      where: { userId: ctx.from.id.toString() }
    });
    const userLang = profile ? profile.language : "ru";
    ctx.replyWithHTML(getTranslation(userLang, "activate_promo"));
  });
  bot.action("contact", async (ctx) => {
    await ctx.answerCbQuery();
    const profile = await Profile.findOne({
      where: { userId: ctx.from.id.toString() }
    });
    const userLang = profile ? profile.language : "ru";
    const message = `С тобой хочет связаться @${ctx.from.username}`;
    await bot.telegram.sendMessage(config.manager, message);
    ctx.reply(getTranslation(userLang, "contact_engineer"));
  });
  bot.action("price", async (ctx) => {
    await ctx.answerCbQuery();
    const profile = await Profile.findOne({
      where: { userId: ctx.from.id.toString() }
    });
    const userLang = profile ? profile.language : "ru";
    ctx.reply(getTranslation(userLang, "price_info"));
  });

  bot.command("settings", async (ctx) => {
    await settingsAction(ctx);
  });

  bot.action("set_lang_ru", async (ctx) => {
    await ctx.answerCbQuery();
    await setLangAction(ctx, "ru");
  });

  bot.action("set_lang_en", async (ctx) => {
    await ctx.answerCbQuery();
    await setLangAction(ctx, "en");
  });

  bot.action("settings", async (ctx) => {
    await ctx.answerCbQuery();
    await settingsAction(ctx);
  });
}
