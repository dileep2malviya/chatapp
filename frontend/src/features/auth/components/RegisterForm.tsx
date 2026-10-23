import CustomButton from '@/components/ui/button'
import { CustomInput, CustomPasswordInput } from '@/components/ui/input/Input'
import { RegisterFormValuesType, registerSchema } from '@/lib/schema/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useRegister } from '../hook/useRegsiter'
import { useEffect, useState } from 'react'
import Link from 'next/link'


const RegisterForm = () => {
    const [preview, setPreview] = useState<string>("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<RegisterFormValuesType>({
        resolver: zodResolver(registerSchema),
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const { userRegister, isLoading } = useRegister(setError)

    const onSubmit = (data: RegisterFormValuesType) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });
        if (avatar) {
            formData.append('avatar', avatar);
        }
        userRegister(formData);
    };

    return (

        <>
            <div className='text-center mr-5'>
                <div className="mx-auto w-18 h-18 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                    <Mail size={40} className='text-white' />
                </div>
                <h1 className="text-4xl font-bold text-white mb-3">
                    Welcome to ChatApp
                </h1>
                <p className="text-gray-300 text-lg">
                    Please register yourself first.
                </p>
            </div>
            <div className="max-w-[70%] flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg pl-6 pr-6 pt-1 pb-1 gap-8">
                <div className="flex flex-col items-center">
                    <div className="mb-6 flex justify-center">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Selected profile preview"
                                className="h-32 w-32 rounded-full border-2 border-blue-500 object-cover"
                            />
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-gray-600 text-center text-sm text-gray-400">
                                No photo selected
                            </div>
                        )}
                    </div>
                    <label htmlFor="avatar" className="cursor-pointer mt-4">
                        <span className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition">
                            Upload Photo
                        </span>
                    </label>

                    <input
                        id="avatar"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <div className=" p-8">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className='flex gap-4'>
                            <CustomInput
                                placeholder="Enter Your First Name"
                                register={register('firstName')}
                                error={errors.firstName?.message}
                                labelText="First Name"
                            />
                            <CustomInput
                                placeholder="Enter Your Last Name"
                                register={register('lastName')}
                                error={errors.lastName?.message}
                                labelText="Last Name"
                            />
                        </div>
                        <CustomInput
                            placeholder="Enter Your Username"
                            register={register('username')}
                            error={errors.username?.message}
                            labelText="Username"
                        />
                        <CustomInput
                            type="text"
                            placeholder="Enter Your Email"
                            register={register('email')}
                            error={errors.email?.message}
                            labelText="Email Address"
                        />
                        <CustomPasswordInput
                            type="password"
                            register={register('password')}
                            error={errors.password?.message}
                            placeholder="Enter Your Password"
                        />
                        <CustomPasswordInput
                            type="password"
                            register={register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                            placeholder="Enter Your Confirm Password"
                            textLabel="Confirm Password"
                        />
                        <CustomButton
                            type='submit'
                            isLoading={isLoading}
                            className='bg-blue-500 flex justify-center'
                        >Register</CustomButton>
                    </form>
                    <div className="flex items-center justify-between text-gray-300 mt-1">
                        <p>
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="underline cursor-pointer"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RegisterForm