const fs = require('fs');
const path = require('path');

const artifactsDir = path.join(__dirname, 'artifacts', 'contracts');

const contracts = [
  'MultiCall',
  'MultiCallStrict',
  'MultiTokenBalanceAndAllowanceGetter',
  'MultiTokenBalanceGetter',
  'UniswapReservesGetter'
];

const outputPath = path.join(__dirname, 'src', 'bytecode.json');
const outputJSON = {};

for (let contract of contracts) {
  const file = path.join(artifactsDir, contract.concat('.sol'), contract.concat('.json'));
  const { bytecode } = require(file);
  outputJSON[contract] = bytecode;
}

fs.writeFileSync(outputPath, JSON.stringify(outputJSON, null, 2));