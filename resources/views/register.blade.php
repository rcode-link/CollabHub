<x-guest-layout>
    <div class="flex h-screen justify-center items-center">
        <div class="w-full min-w-[100vw] md:min-w-[50vw]">
            <div
                class="max-w-sm m-auto p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <form action="{{ route('register') }}" class="w-full grid gap-6" method="post">
                    @csrf
                    <input type="hidden" name="company_id" value="{{ $company_id }}">
                    <h2 class="text-3xl font-bold">Register</h2>
                    <div>
                        <label for="email">Email</label>
                        <input type="text"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               name="email" id="email" placeholder="Email"
                        value="{{old('email')}}"
                        />
                        <x-input-error :messages="$errors->get('email')" class="mt-2" />
                    </div>
                    <div>
                        <label for="name">Full Name</Label>
                        <input type="text"
                               value="{{old('name')}}"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               name="name" id="name" placeholder="Full Name"/>
                        <Errors name="email"/>
                        <x-input-error :messages="$errors->get('name')" class="mt-2" />
                    </div>
                    <div>
                        <label for="password">Password</Label>
                        <input type="password"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               name="password" id="password"
                               placeholder="New Password"/>
                        <x-input-error :messages="$errors->get('password')" class="mt-2" />
                    </div>
                    <div>
                        <label for="password_confirmation">Confirm Password</Label>
                        <input type="password"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               name="password_confirmation" id="password_confirmation"
                               placeholder="Confirm Password"/>
                    </div>

                    <div class="card-actions justify-end">
                        <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        >Register</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

</x-guest-layout>
