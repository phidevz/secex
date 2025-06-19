import type { SignatureVerification } from "~/backend";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { SignatureBlock } from "~/app/(user)/download/[folder]/[file]/_components/SignatureBlock";

export function SignatureTotal(props: {
  signatures: SignatureVerification[] | undefined;
}) {
  const { signatures } = props;
  if (signatures === undefined || signatures.length === 0) {

    return (
      <div role="paragraph">
        <span>
          {/* @ts-expect-error Icon works */}
          <ExclamationCircleFilled className="signature-icon not-signed" />
          Not signed
        </span>
      </div>
    );
  }

  return (
    <div role="paragraph">
      {signatures.map((signature, index) => (
        <div key={index}>
          <span>Signature {index + 1}:</span>
          <SignatureBlock key={index} signature={signature} />
        </div>
      ))}
    </div>
  );
}