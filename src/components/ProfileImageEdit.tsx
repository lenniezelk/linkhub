import ProfileImage from "./ProfileImage";

interface ProfileImageProps {
    imageUrl?: string,
    submitProfileImage: (e: React.FormEvent<HTMLFormElement>) => void,
    isSubmittingProfileImage: boolean,
}

function ProfileImageEdit({ imageUrl, submitProfileImage, isSubmittingProfileImage }: ProfileImageProps) {
    return (
        <>
            <div className="w-[200px] h-[200px]">
                <ProfileImage imageUrl={imageUrl} />
            </div>
            <form noValidate className='mt-4' onSubmit={submitProfileImage} encType='multipart/form-data'>
                <label
                    htmlFor="fileUpload"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-disabled={isSubmittingProfileImage}
                >
                    {isSubmittingProfileImage ? 'Uploading...' : 'Choose a Profile Image'}
                </label>
                <input
                    type="file"
                    id="fileUpload"
                    name="fileUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            e.target.form?.requestSubmit();
                        }
                    }}
                    disabled={isSubmittingProfileImage}
                />
            </form>
        </>
    )
}

export default ProfileImageEdit;