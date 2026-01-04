import { Package, MapPin, Calendar, Truck, CheckCircle, Clock, User, XCircle, QrCode, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { useState, useEffect } from 'react';

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: string) => void;
  onTrack?: (order: Order) => void;
  onContact?: (order: Order) => void;
  onRate?: (order: Order) => void;
  onPaymentComplete?: (orderId: string) => void;
  onOrderUpdate?: () => void;
}

// QR Payment Modal Component
interface QRPaymentModalProps {
  order: Order;
  onClose: () => void;
  onPaymentComplete: (orderId: string) => void;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ order, onClose, onPaymentComplete }) => {
  const [timeLeft, setTimeLeft] = useState<number>(60); // Increased to 60 seconds (1 minute)
  const [isExpired, setIsExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  // Calculate initial time left based on payment expiry
  useEffect(() => {
    if (order.paymentExpiry) {
      const expiryTime = new Date(order.paymentExpiry).getTime();
      const currentTime = new Date().getTime();
      const remainingTime = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
      setTimeLeft(remainingTime);
      
      if (remainingTime === 0) {
        setIsExpired(true);
      }
    } else {
      // Set default to 60 seconds if no expiry is provided
      setTimeLeft(60);
    }
  }, [order.paymentExpiry]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    if (paymentStatus === 'pending' && !isProcessing) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, paymentStatus, isProcessing]);

  const handlePaymentComplete = async () => {
    if (isExpired || isProcessing) {
      console.log('Payment cannot be processed: expired or already processing');
      return;
    }
    
    console.log('Starting payment processing...');
    setIsProcessing(true);
    
    try {
      await onPaymentComplete(order._id);
      console.log('Payment completed successfully');
      setPaymentStatus('success');
      
      // Show success message for 3 seconds before closing
      setTimeout(() => {
        console.log('Closing payment modal after success');
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalAmount = (order.finalAmount || order.productPrice) * (order.quantity || 1);

  const handleRetryPayment = () => {
    setTimeLeft(60); // Reset to 60 seconds
    setPaymentStatus('pending');
    setIsExpired(false);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">
            {paymentStatus === 'success' ? 'Payment Successful!' : 
             paymentStatus === 'failed' ? 'Payment Failed' : 'Complete Payment'}
          </h3>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {paymentStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-green-600 mb-2">Payment Completed!</h4>
                <p className="text-gray-600">Your order has been confirmed.</p>
                <p className="text-sm text-gray-500 mt-2">₹{totalAmount} has been paid successfully.</p>
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Order Status:</strong> {order.deliveryType === 'home_delivery' ? 'Out for Delivery' : 'Confirmed'}
                  </p>
                </div>
              </div>
            ) : paymentStatus === 'failed' ? (
              <div className="text-center py-8">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h4>
                <p className="text-gray-600">There was an issue processing your payment.</p>
                <p className="text-sm text-gray-500 mt-2">Please try again or contact support.</p>
              </div>
            ) : (
              <>
                {/* QR Code Display */}
                <div className="text-center">
                  <div className="bg-gray-100 p-6 rounded-lg mb-4">
                    <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 flex flex-col items-center">
                      {/* Wikipedia QR Code Image */}
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                        alt="UPI Payment QR Code"
                        className="w-48 h-48 mx-auto mb-3 rounded-lg border border-gray-200 object-contain"
                      />
                      {!isExpired && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Scan with any UPI app</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-2xl font-bold text-green-600 mb-2">₹{totalAmount}</p>
                  <p className="text-sm text-gray-500">
                    {isExpired ? 'QR Code Expired' : `Valid for ${formatTime(timeLeft)}`}
                  </p>
                </div>

                {/* Payment Status */}
                {isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 font-medium">QR Code Expired</p>
                    <p className="text-red-500 text-sm mt-1">Please request a new payment link from the farmer</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <p className="text-green-600 font-medium">Waiting for Payment</p>
                    </div>
                    <p className="text-green-500 text-sm">Complete payment within {formatTime(timeLeft)}</p>
                  </div>
                )}

                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span className="font-medium">{order.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-medium">{order.quantity || 1} {order.unit || 'item'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="font-medium capitalize">
                        {order.deliveryType?.replace('_', ' ') || 'pickup'}
                      </span>
                    </div>
                    {order.deliveryCharge > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Charge:</span>
                        <span className="font-medium">₹{order.deliveryCharge}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 mt-1">
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">How to Pay:</h5>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Open any UPI app on your phone</li>
                    <li>Tap on "Scan QR Code"</li>
                    <li>Point your camera at the QR code above</li>
                    <li>Confirm the payment details and complete the transaction</li>
                    <li>Click "I Have Paid" below to confirm</li>
                  </ol>
                </div>

                {/* Alternative Payment Methods */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Other Payment Options:</h5>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p><strong>UPI ID:</strong> farmer@upi</p>
                    <p><strong>PhonePe:</strong> Open PhonePe → Pay → Enter UPI ID</p>
                    <p><strong>Google Pay:</strong> Open GPay → New Payment → Enter UPI ID</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer with Button - Fixed at bottom */}
        <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
          {paymentStatus === 'success' ? (
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors w-full max-w-xs"
              >
                Continue
              </button>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRetryPayment}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex-1"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentComplete}
                disabled={isExpired || isProcessing}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 flex-1 ${
                  isExpired || isProcessing
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>I Have Paid</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ... rest of the OrderCard component remains exactly the same as in the previous response ...
// (The OrderCard component code remains unchanged below this point)

export default function OrderCard({ order, onCancel, onTrack, onContact, onRate, onPaymentComplete, onOrderUpdate }: OrderCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);

  // Update local order state when prop changes
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending Farmer Approval'
        };
      case 'payment_pending':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: QrCode,
          label: 'Payment Required'
        };
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
          label: 'Confirmed'
        };
      case 'delivery':
        return {
          color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          icon: Truck,
          label: 'Out for Delivery'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Rejected'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Package,
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(currentOrder.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    try {
      let date: Date;
      
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getUnitPrice = () => {
    return currentOrder.finalAmount || currentOrder.productPrice || 0;
  };

  const getQuantity = () => {
    return currentOrder.quantity && currentOrder.quantity > 0 ? currentOrder.quantity : 1;
  };

  const getTotalPrice = () => {
    const quantity = getQuantity();
    const unitPrice = getUnitPrice();
    return quantity * unitPrice;
  };

  const getUnit = () => {
    return currentOrder.unit || 'item';
  };

  // Function to convert decimal coordinates to degrees, minutes, seconds format
  const decimalToDMS = (deg: number, isLat: boolean) => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
    
    const direction = isLat 
      ? (deg >= 0 ? 'N' : 'S')
      : (deg >= 0 ? 'E' : 'W');
    
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  // Function to create Google Maps link from coordinates
  const getGoogleMapsLink = (location: { lat: number; lng: number; address: string } | undefined) => {
    if (!location || !location.lat || !location.lng) return null;
    
    // Convert coordinates to DMS format
    const latDMS = decimalToDMS(location.lat, true);
    const lngDMS = decimalToDMS(location.lng, false);
    
    // Create the Google Maps URL in the exact format you provided
    const mapsUrl = `https://www.google.com/maps/place/${encodeURIComponent(latDMS)}+${encodeURIComponent(lngDMS)}/@${location.lat},${location.lng},17z/data=!3m1!4b1!4m4!3m3!8m2!3d${location.lat}!4d${location.lng}?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D`;
    
    return mapsUrl;
  };

  // Function to create Google Maps link from address (fallback) - REMOVED "Location:" text
  const getGoogleMapsLinkFromAddress = (address: string) => {
    if (!address) return null;
    
    // Remove "Location:" text if present and clean the address
    let cleanAddress = address;
    if (address.includes('Location:')) {
      cleanAddress = address.replace('Location:', '').trim();
    }
    
    // Clean format for address search - just use coordinates or clean address
    if (cleanAddress.includes(',')) {
      // If it contains coordinates, extract just the numbers
      const coordMatch = cleanAddress.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    }
    
    // Use clean address for search
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
  };

  // Function to clean address display - remove "Location:" text
  const cleanAddressDisplay = (address: string) => {
    if (!address) return '';
    if (address.includes('Location:')) {
      return address.replace('Location:', '').trim();
    }
    return address;
  };

  const handlePaymentClick = () => {
    console.log('Opening payment modal for order:', currentOrder._id);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (orderId: string) => {
    console.log('Handling payment completion for order:', orderId);
    
    if (onPaymentComplete) {
      try {
        await onPaymentComplete(orderId);
        console.log('Payment completed, updating order state');
        
        // Update local order state to reflect payment completion
        setCurrentOrder(prev => ({
          ...prev,
          status: prev.deliveryType === 'home_delivery' ? 'delivery' : 'confirmed',
          paymentStatus: 'completed'
        }));
        
        // Notify parent to refresh orders
        if (onOrderUpdate) {
          console.log('Notifying parent to refresh orders');
          setTimeout(() => {
            onOrderUpdate();
          }, 1000);
        }
      } catch (error) {
        console.error('Payment completion failed:', error);
        throw error;
      }
    }
  };

  const handleClosePaymentModal = () => {
    console.log('Closing payment modal');
    setShowPaymentModal(false);
    
    // Refresh orders when modal closes to ensure we have latest data
    if (onOrderUpdate) {
      setTimeout(() => {
        onOrderUpdate();
      }, 500);
    }
  };

  // Check if payment is expired
  const isPaymentExpired = currentOrder.paymentExpiry && new Date(currentOrder.paymentExpiry) < new Date();

  // Get Google Maps links
  const customerMapsLink = currentOrder.customerLocation ? 
    getGoogleMapsLink(currentOrder.customerLocation) : 
    getGoogleMapsLinkFromAddress(currentOrder.deliveryLocation || '');

  const farmerMapsLink = currentOrder.farmerLocation ? 
    getGoogleMapsLink(currentOrder.farmerLocation) : 
    getGoogleMapsLinkFromAddress(currentOrder.deliveryLocation || '');

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* Order Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {currentOrder.productName}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="text-xs">ID: {currentOrder._id?.substring(0, 8)}...</span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(currentOrder.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 lg:mt-0 lg:ml-4">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.label}</span>
            </span>
          </div>
        </div>

        {/* Payment Status Alerts */}
        {currentOrder.status === 'payment_pending' && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Payment Required</p>
                  <p className="text-sm text-orange-600">
                    {isPaymentExpired ? 'QR Code has expired' : 'Complete payment to confirm your order'}
                  </p>
                  {currentOrder.paymentExpiry && !isPaymentExpired && (
                    <p className="text-xs text-orange-500 mt-1">
                      Expires: {new Date(currentOrder.paymentExpiry).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handlePaymentClick}
                disabled={isPaymentExpired}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                  isPaymentExpired
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>{isPaymentExpired ? 'Expired' : 'Pay Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Success Alert */}
        {currentOrder.paymentStatus === 'completed' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Payment Completed</p>
                <p className="text-sm text-green-600">
                  Your order is now {currentOrder.status === 'delivery' ? 'out for delivery' : 'confirmed'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Unit Price:</span>
              <span className="font-medium">₹{getUnitPrice()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">
                {getQuantity()} {getUnit()}
              </span>
            </div>
            
            {currentOrder.deliveryCharge && currentOrder.deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charge:</span>
                <span className="font-medium">₹{currentOrder.deliveryCharge}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Type:</span>
              <span className="font-medium capitalize">
                {currentOrder.deliveryType?.replace('_', ' ') || 'pickup'}
              </span>
            </div>
            
            {/* Customer Delivery Location with Google Maps Link */}
            {currentOrder.deliveryLocation && (
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-start">
                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  Delivery Location:
                </span>
                <div className="text-right max-w-xs">
                  <span className="font-medium block">{cleanAddressDisplay(currentOrder.deliveryLocation)}</span>
                  {customerMapsLink && (
                    <a 
                      href={customerMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center justify-end mt-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Farmer Pickup Location with Google Maps Link */}
            {currentOrder.farmerLocation && currentOrder.deliveryType === 'pickup' && (
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-start">
                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  Pickup Location:
                </span>
                <div className="text-right max-w-xs">
                  <span className="font-medium block">{cleanAddressDisplay(currentOrder.farmerLocation.address)}</span>
                  {farmerMapsLink && (
                    <a 
                      href={farmerMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center justify-end mt-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Customer Location with Coordinates (for home delivery) */}
            {currentOrder.customerLocation?.address && currentOrder.deliveryType === 'home_delivery' && (
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-start">
                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  Customer Location:
                </span>
                <div className="text-right max-w-xs">
                  <span className="font-medium block">{cleanAddressDisplay(currentOrder.customerLocation.address)}</span>
                  {customerMapsLink && (
                    <a 
                      href={customerMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center justify-end mt-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in Google Maps
                    </a>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {currentOrder.customerLocation.lat?.toFixed(6)}, {currentOrder.customerLocation.lng?.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-3 w-3" />
              <span>Farmer: {currentOrder.farmerName}</span>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Order Total ({getQuantity()} {getUnit()})
          </div>
          <div className="text-xl font-bold text-green-700">
            ₹{getTotalPrice()}
          </div>
        </div>

        {/* Order Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
          {currentOrder.status === 'pending' && (
            <>
              <button 
                onClick={() => onTrack?.(currentOrder)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Track Order
              </button>
              <button 
                onClick={() => onCancel?.(currentOrder._id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Cancel Order
              </button>
            </>
          )}
          {currentOrder.status === 'payment_pending' && (
            <button
              onClick={handlePaymentClick}
              disabled={isPaymentExpired}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                isPaymentExpired
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>{isPaymentExpired ? 'QR Expired' : 'Pay Now'}</span>
            </button>
          )}
          {(currentOrder.status === 'confirmed' || currentOrder.status === 'delivery') && (
            <button 
              onClick={() => onTrack?.(currentOrder)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              {currentOrder.status === 'delivery' ? 'View Tracking' : 'Track Order'}
            </button>
          )}
          {currentOrder.status === 'completed' && (
            <button 
              onClick={() => onRate?.(currentOrder)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Rate & Review
            </button>
          )}
          
          <button 
            onClick={() => onContact?.(currentOrder)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Contact Farmer
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <QRPaymentModal
          order={currentOrder}
          onClose={handleClosePaymentModal}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}