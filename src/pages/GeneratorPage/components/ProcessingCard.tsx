import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import React from "react";

interface ProcessingCardProps {
  isProcessing: boolean;
}

export const ProcessingCard: React.FC<ProcessingCardProps> = ({
  isProcessing,
}) => {
  if (!isProcessing) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <Clock size={24} className="text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900">
            Traitement en cours...
          </h3>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Redimensionnement et mapping des couleurs LEGO...
        </p>
      </CardContent>
    </Card>
  );
};