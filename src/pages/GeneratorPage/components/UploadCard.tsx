import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImageIcon, Upload } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Upload size={24} className="text-blue-600" />
          <span>Uploader votre image</span>
        </h3>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Glissez-déposez votre image ici
          </p>
          <p className="text-gray-500 mb-4">
            ou cliquez pour parcourir vos fichiers
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Choisir un fichier
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
