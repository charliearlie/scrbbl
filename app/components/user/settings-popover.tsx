import { Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Form } from "@remix-run/react";

export default function SettingsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button>
          <Settings className="h-6 w-6 hover:opacity-50" />
          <span className="sr-only">Open popover</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white dark:bg-slate-900">
        <Form method="post" action="/">
          <button className="button button-danger">Log out</button>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
