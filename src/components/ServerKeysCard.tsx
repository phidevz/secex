"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { PlusIcon } from "lucide-react";
import type { $ListServerKeys } from "~/server/api/routers/admin";
import { useState } from "react";
import { AddKeyDialog } from "~/components/AddKeyDialog";

export function ServerKeysCard(props: { serverKeys: $ListServerKeys }) {
  const { serverKeys } = props;

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription>Server Schlüssel</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {serverKeys.length}
          </CardTitle>
          <CardAction>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <PlusIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <AddKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
