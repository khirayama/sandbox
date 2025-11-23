export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-700">{message}</p>
  </div>
);
