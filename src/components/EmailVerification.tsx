import Button from "./Button";

interface EmailVerificationProps {
    emailVerified: boolean;
    onVerifyEmail: () => void;
    sendingVerification: boolean;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ emailVerified, onVerifyEmail, sendingVerification }) => {
    if (emailVerified) {
        return <p className="text-green-600 font-medium mt-4">Your email is verified.</p>;
    }

    return (
        <div className="mt-4 p-4 border border-yellow-400 bg-yellow-50 rounded">
            <p className="text-yellow-800 mb-2">This is a demo app so we will not send a verification email. Click the button below to simulate a verification email being sent.</p>
            <Button
                onClick={onVerifyEmail}
                disabled={sendingVerification}
            >
                {sendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </Button>
        </div>
    );
}

export default EmailVerification;