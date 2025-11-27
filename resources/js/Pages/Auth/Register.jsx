import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <>
            <Head title="Register" />

            <div className="min-h-screen flex items-center justify-center bg-gpt-50">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-theme-sm border">

                    <h2 className="text-xl font-semibold mb-6 text-center">
                        Create an account
                    </h2>

                    <form onSubmit={submit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="w-full rounded-lg border-gpt-300 focus:border-brand-500 focus:ring-brand-500"
                                required
                            />
                            {errors.name && (
                                <div className="text-error-500 text-sm mt-1">{errors.name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className="w-full rounded-lg border-gpt-300 focus:border-brand-500 focus:ring-brand-500"
                                required
                            />
                            {errors.email && (
                                <div className="text-error-500 text-sm mt-1">{errors.email}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                className="w-full rounded-lg border-gpt-300 focus:border-brand-500 focus:ring-brand-500"
                                required
                            />
                            {errors.password && (
                                <div className="text-error-500 text-sm mt-1">{errors.password}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                className="w-full rounded-lg border-gpt-300 focus:border-brand-500 focus:ring-brand-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-brand-500 text-white py-2.5 rounded-lg hover:bg-brand-600 transition"
                        >
                            Register
                        </button>

                    </form>

                    <div className="text-center mt-4 text-sm">
                        <Link
                            href={route("login")}
                            className="text-brand-500 hover:text-brand-600"
                        >
                            Already have an account?
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}
