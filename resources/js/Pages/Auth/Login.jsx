import { Head, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: "",
        password: "",
    });

    const [isDark, setIsDark] = useState(false);

    // On mount, read saved theme
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        } else {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        const willBeDark = !html.classList.contains("dark");

        if (willBeDark) {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }

        setIsDark(willBeDark);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Sign In" />

            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gpt-50 dark:bg-gpt-950">
                {/* LEFT: FORM */}
                <div className="flex items-center justify-center p-6">
                    <div className="w-full max-w-md">
                        {/* Theme toggle (top-right of form area) */}
                        <div className="flex justify-end mb-6">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="text-theme-sm px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gpt-700
                                           bg-white dark:bg-gpt-900 text-gray-700 dark:text-gpt-200
                                           hover:border-brand-500 dark:hover:border-brand-400 transition"
                            >
                                {isDark ? "Light Mode" : "Dark Mode"}
                            </button>
                        </div>

                        <h1 className="text-title-sm font-bold text-gpt-900 dark:text-white">
                            Sign In
                        </h1>
                        <p className="text-theme-sm text-gpt-500 dark:text-gpt-300 mt-1">
                            Enter your username and password to sign in.
                        </p>

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gpt-200 mb-1">
                                    Username <span className="text-error-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) =>
                                        setData("username", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gpt-300 dark:border-gpt-700
                                               bg-white dark:bg-gpt-900
                                               text-gpt-900 dark:text-white
                                               focus:border-brand-500 focus:ring-brand-500"
                                    placeholder="Enter your username"
                                    required
                                    autoFocus
                                />
                                {errors.username && (
                                    <div className="text-error-500 text-theme-sm mt-1">
                                        {errors.username}
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-theme-sm font-medium text-gray-700 dark:text-gpt-200 mb-1">
                                    Password <span className="text-error-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="w-full rounded-lg border-gpt-300 dark:border-gpt-700
                                               bg-white dark:bg-gpt-900
                                               text-gpt-900 dark:text-white
                                               focus:border-brand-500 focus:ring-brand-500"
                                    placeholder="Enter your password"
                                    required
                                />
                                {errors.password && (
                                    <div className="text-error-500 text-theme-sm mt-1">
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-brand-500 text-white py-3 rounded-lg font-medium shadow-theme-sm
                                           hover:bg-brand-600 transition disabled:opacity-60"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: BRAND PANEL */}
                <div className="hidden lg:flex items-center justify-center bg-[#38848D] dark:bg-[#2d6a70] relative overflow-hidden">
                    {/* subtle grid squares */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />

                    <div className="relative z-10 text-center px-10">
                        {/* Single logo (no switching) */}
                        <img
                            src="/assets/logo/pamelas-logo.png"
                            alt="Logo"
                            className="mx-auto mb-6 w-28 h-auto"
                        />

                        <h2 className="text-white text-2xl font-semibold">
                            Pamela's Onlien Shop
                        </h2>
                        <p className="text-white/80 text-theme-sm mt-2">
                            Inventory Management System with Barcode Generation
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
