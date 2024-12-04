import { useState } from "react";
import { encodeFileAsBase64 } from "@/utils/encodeFileAsBase64";
import { generateQuizTitle } from "@/services/generateQuizTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FileWithBase64 {
  name: string;
  type: string;
  data: string;
}

const MyComponent = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("medium");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      }))
    );
    submit({ files: encodedFiles, difficulty });
    const generatedTitle = await generateQuizTitle(encodedFiles[0].name);
    setTitle(generatedTitle);
  };

  const submit = (data: { files: FileWithBase64[]; difficulty: string }) => {
    console.log("Submitting data:", data);
  };


  return (
    <form onSubmit={handleSubmitWithFiles}>
      <input type="file" multiple onChange={handleFileChange} />
      <Select value={difficulty} onValueChange={setDifficulty}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>
      <button type="submit">Generate Quiz</button>
      <p>Generated Title: {title}</p>
    </form>
  );
};

export default MyComponent;
