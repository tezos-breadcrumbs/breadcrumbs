var exec = require("child_process").exec;

export const seed = (file: string): void => {
  exec(
    `npx sequelize-cli db:seed --seed ${file}`,
    function (error, stdout, _stderr) {
      if (error) console.log(`Error: ${error}`);
      else console.log(stdout);
    }
  );
};

export const revertSeed = (file: string): void => {
  exec(
    `npx sequelize-cli db:seed:undo --seed ${file}`,
    function (error, stdout, _stderr) {
      if (error) console.log(`Error: ${error}`);
      else console.log(stdout);
    }
  );
};
