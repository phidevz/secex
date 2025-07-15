"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { ServerKeyAlgorithm } from "~/server/api/routers/admin";
import { api } from "~/trpc/react";

interface AddKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultCurve = "nistP256" satisfies ServerKeyAlgorithm;

export function AddKeyDialog({ open, onOpenChange }: AddKeyDialogProps) {
  const [keyName, setKeyName] = useState("");
  const [keyEmail, setKeyEmail] = useState("");
  const [keyComment, setKeyComment] = useState("");
  const [curve, setCurve] = useState<ServerKeyAlgorithm>(defaultCurve);

  const mutate = api.admin.addServerKey.useMutation();

  const isAdding = mutate.isPending;

  const handleAddKey = async () => {
    const { id, fingerprint } = await mutate.mutateAsync({
      algorithm: curve,
      name: keyName,
      email: keyEmail,
      comment: keyComment,
    });

    alert(`PGP key added successfully! ID = ${id}, FP = ${fingerprint}`);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setKeyName("");
    setKeyEmail("");
    setKeyComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="text-primary h-5 w-5" />
            Add New PGP Key
          </DialogTitle>
          <DialogDescription>
            Add a new PGP key to your admin keyring
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sicherheitseinstellungen</CardTitle>
            <CardDescription>
              Wählen Sie hier basierend auf Ihren Anforderungen eine Option.
              Falls Sie keine speziellen Anforderungen haben, können Sie beim
              Standard bleiben.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              defaultValue={defaultCurve}
              onValueChange={(value) => setCurve(value as ServerKeyAlgorithm)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rsa4096" id="rsa4096" />
                <Label htmlFor="rsa4096">RSA: 4096 bit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nistP256" id="nistP256" />
                <Label htmlFor="nistP256">
                  ECC: nistP256 <span className="italic">(empfohlen)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nistP384" id="nistP384" />
                <Label htmlFor="nistP384">ECC: nistP384</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nistP521" id="nistP521" />
                <Label htmlFor="nistP521">ECC: nistP521</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identität</CardTitle>
            <CardDescription>
              Hier sollten Sie alle Felder ausfüllen, da sie dem Nutzer
              angezeigt werden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Name</Label>
                <Input
                  id="keyName"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyEmail">Email</Label>
                <Input
                  id="keyEmail"
                  type="email"
                  value={keyEmail}
                  onChange={(e) => setKeyEmail(e.target.value)}
                  placeholder="max.mustermann@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddKey}
            disabled={isAdding || !keyName || !keyEmail}
          >
            {isAdding ? "Adding Key..." : "Add Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
