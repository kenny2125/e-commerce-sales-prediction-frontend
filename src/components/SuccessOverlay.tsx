import { CheckCircle } from "lucide-react";

interface SuccessOverlayProps {
  message: string;
}

export function SuccessOverlay({ message }: SuccessOverlayProps) {
  return (
    <div className="h-fit flex flex-col items-center justify-center z-50 animate-fadeIn mb-16">
      <CheckCircle className="w-20 h-20 text-green-500 " />
      <h2 className="text-2xl font-bold text-green-600">{message}</h2>
    </div>
  );
}
