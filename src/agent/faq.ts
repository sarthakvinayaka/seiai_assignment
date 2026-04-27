import type { Intent } from "../types";

const FAQ: Record<Intent, string> = {
  check_status:
    "You can track your transfer in Wise. Log in, go to Home, and select the transfer from your activity list. The tracker will show the latest status and any delays.",
  transfer_timeline:
    "Wise shows an up-to-date estimated arrival time in the transfer tracker. Log in, go to Home, open the transfer, and check the estimate there.",
  delayed_transfer:
    "Delays are shown in the Wise transfer tracker along with an updated arrival estimate. If you sent the transfer over a weekend or before a holiday, processing may start on the next working day when banks are open.",
  transfer_complete_but_not_arrived:
    "If it says Transfer sent but it has not arrived yet, the recipient’s bank may still take a few working days to deliver it. Ask the recipient to check for a transaction from Wise or one of Wise’s banking partners, using the amount or reference to help locate it.",
  proof_of_payment:
    "You can check the transfer’s progress in the Wise tracker. Log in, go to Home, and open the transfer from your activity list to see the latest status and details.",
  banking_partner_reference:
    "For transfers marked sent or complete, ask the recipient to look for a transaction from Wise or one of Wise’s banking partners. The amount or reference on the transfer can help their bank locate it."
};

export function buildAnswer(intent: Intent): string {
  return FAQ[intent];
}

