import * as ledger from '@midnight-ntwrk/ledger-v8';
import { HttpProverClient } from '@midnight-ntwrk/wallet-sdk-prover-client';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

setNetworkId('preview');
const proverClient = new HttpProverClient({ url: new URL('http://127.0.0.1:6300') });
const costModel = ledger.CostModel.initialCostModel();

async function test() {
  const start = Date.now();
  const unprovenTx = ledger.Transaction.fromParts('preview', undefined, undefined, undefined);
  const provenTx = await proverClient.proveTransaction(unprovenTx, costModel);
  const boundTx = provenTx.bind();
  const txHash = '0x' + boundTx.transactionHash();
  const elapsed = Date.now() - start;
  console.log('SUCCESS: proof generated in', elapsed, 'ms. TxHash:', txHash);
}

test().catch(console.error);
