import type { Route } from "./+types/_index";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "web/nanasi-1" },
    { name: "description", content: "nanasi-1（とClaude）が作った雑多なWebアプリ置き場" },
  ];
}

export default function Home() {
  return <Welcome />;
}
