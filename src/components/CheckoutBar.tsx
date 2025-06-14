
interface CheckoutBarProps {
  totalPrice: number;
  itemCount: number;
  onCheckout?: () => void;
}

export default function CheckoutBar({ totalPrice, itemCount, onCheckout }: CheckoutBarProps) {
  if (itemCount === 0) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {itemCount}
        </div>
        <span className="font-medium">Checkout</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="font-bold text-lg">Total: RM {totalPrice}</span>
        <button
          onClick={onCheckout}
          className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-full font-medium transition-colors"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}
