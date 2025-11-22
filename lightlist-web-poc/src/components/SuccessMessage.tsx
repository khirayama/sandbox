export const SuccessMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
    <p className="text-sm text-green-700">{message}</p>
  </div>
);
