import type { SignatureVerification } from "~/backend";
import {CheckCircle2Icon, ShieldQuestionIcon} from "lucide-react";

export function SignatureBlock(props: { signature: SignatureVerification }) {
  const v = props.signature;
  if (v.state === "Valid") {
    const userIds = v.signingKey.getUserIDs();
    return (
      <>
        <span>
          <CheckCircle2Icon className="signature-icon signed-valid" />
          valid, signed by &#39;{userIds[0]}&#39;
          {userIds.length > 1 && (
            <span> (and {userIds.length - 1} other name(s))</span>
          )}
        </span>
      </>
    );
  } else if (v.state === "Unknown") {
    const keyId = v.signingKey.toHex();
    return (
      <>
        <span>
          <ShieldQuestionIcon className="signature-icon signed-unknown" />
          Cannot verify signature (key ID: {keyId})
        </span>
      </>
    );
  }

  return (
    <>
      <span>todo</span>
    </>
  );
}
