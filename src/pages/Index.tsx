
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Stock Tracker</h1>
        <p className="text-xl text-gray-600 mb-8">Track and analyze stocks with real-time data</p>
        <Button asChild size="lg">
          <Link to="/stocks">View Stocks</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
