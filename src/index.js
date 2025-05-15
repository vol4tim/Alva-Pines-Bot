import { SQLite } from "@telegraf/session/sqlite";
import { session } from "telegraf";
import bot from "./bot";
import { PATH_SESSION_DB, config } from "./config";
import db from "./models/db";
import { start } from "./scenes/start";

const runApp = () => {
  const store = SQLite({
    filename: PATH_SESSION_DB
  });
  bot.use(
    session({
      store,
      defaultSession: () => ({})
    })
  );

  bot.use(async (ctx, next) => {
    if (ctx.chat.type === "group") {
      if (
        !config.adminsGroup ||
        ctx.message.chat.id !== config.adminsGroup ||
        !ctx.message.reply_to_message ||
        ctx.message.reply_to_message.from.id !== config.bot.id
      ) {
        return;
      }
    }
    await next();
  });

  start();

  bot.launch();
};

db.sequelize.sync().then(() => {
  runApp();
});
