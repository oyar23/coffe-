import { getTheme, getBackground } from "@/lib/data/settings";
import BrandEditor from "./BrandEditor";
export default function MarcaPage() {
  return (
    <BrandEditor
      initialTheme={getTheme()}
      initialBackground={getBackground()}
    />
  );
}
