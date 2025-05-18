        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const appContainer = document.getElementById('app-container');
            const userProfile = document.getElementById('user-profile');
            const userMenu = document.getElementById('user-menu');
            const userAvatar = document.getElementById('user-avatar');
            const usernameDisplay = document.getElementById('username-display');
            const resetDataBtn = document.getElementById('reset-data');

            // DOM Elements - App
            const setBudgetBtn = document.getElementById('set-budget');
            const addExpenseBtn = document.getElementById('add-expense');
            const exportDataBtn = document.getElementById('export-data');
            const expenseModal = document.getElementById('expense-modal');
            const budgetModal = document.getElementById('budget-modal');
            const exportModal = document.getElementById('export-modal');
            const expenseForm = document.getElementById('expense-form');
            const budgetForm = document.getElementById('budget-form');
            const exportCsvBtn = document.getElementById('export-csv');
            const exportJsonBtn = document.getElementById('export-json');
            const expenseList = document.getElementById('expense-list');
            const totalBudgetEl = document.getElementById('total-budget');
            const totalExpensesEl = document.getElementById('total-expenses');
            const savingsEl = document.getElementById('savings');
            const categoryFilter = document.getElementById('category-filter');
            const dayFilter = document.getElementById('day-filter');
            const sortFilter = document.getElementById('sort-filter');
            const closeButtons = document.querySelectorAll('.close');
            const categoryChart = document.getElementById('category-chart');
            const scrollProgress = document.querySelector('.scroll-progress');
            
            // Stats elements
            const avgDailyExpenseEl = document.getElementById('avg-daily-expense');
            const highestExpenseEl = document.getElementById('highest-expense');
            const totalDaysEl = document.getElementById('total-days');
            const mostExpensiveCategoryEl = document.getElementById('most-expensive-category');

            // App State
            let state = {
                budget: 0,
                tripDuration: 0,
                expenses: [],
                days: new Set()
            };

            // Initialize 3D Animations
            function createCubes() {
                const cubes = document.querySelectorAll('.cube');
                cubes.forEach(cube => {
                    // Random position and animation
                    const randomX = Math.random() * 80 + 10; // 10% to 90%
                    const randomY = Math.random() * 80 + 10; // 10% to 90%
                    const randomDuration = Math.random() * 20 + 10; // 10s to 30s
                    const randomDelay = Math.random() * 5; // 0s to 5s
                    
                    cube.style.left = `${randomX}%`;
                    cube.style.top = `${randomY}%`;
                    cube.style.animationDuration = `${randomDuration}s`;
                    cube.style.animationDelay = `${randomDelay}s`;
                });
            }

            // Scroll Reveal Animation
            function handleScrollReveal() {
                const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-zoom, .scroll-reveal-rotate');
                
                revealElements.forEach(element => {
                    const elementTop = element.getBoundingClientRect().top;
                    const elementBottom = element.getBoundingClientRect().bottom;
                    
                    // Check if element is in viewport
                    if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                        element.classList.add('active');
                    }
                });
            }

            // Scroll Progress Bar
            function updateScrollProgress() {
                const scrollPosition = window.scrollY;
                const totalHeight = document.body.scrollHeight - window.innerHeight;
                const progress = (scrollPosition / totalHeight) * 100;
                scrollProgress.style.width = `${progress}%`;
            }

            // Parallax Effect
            function handleParallax() {
                const parallaxItems = document.querySelectorAll('.parallax-item');
                
                window.addEventListener('mousemove', (e) => {
                    const mouseX = e.clientX / window.innerWidth;
                    const mouseY = e.clientY / window.innerHeight;
                    
                    parallaxItems.forEach(item => {
                        const speed = item.getAttribute('data-speed') || 0.05;
                        const x = (mouseX - 0.5) * 100 * speed;
                        const y = (mouseY - 0.5) * 100 * speed;
                        
                        item.style.transform = `translate(${x}px, ${y}px)`;
                    });
                });
            }

            // Load data from localStorage
            function loadData() {
                const savedState = localStorage.getItem('vacationExpenseTracker');
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    state.budget = parsedState.budget || 0;
                    state.tripDuration = parsedState.tripDuration || 0;
                    state.expenses = parsedState.expenses || [];
                    
                    // Rebuild the days Set
                    state.days = new Set(Array.from(parsedState.days || []));
                    
                    // Update UI
                    updateDashboard();
                    renderExpenses();
                    updateDayFilter();
                    updateStats();
                    renderCategoryChart();
                }
            }

            // Save data to localStorage
            function saveData() {
                // Convert Set to Array for JSON serialization
                const stateToSave = {
                    ...state,
                    days: Array.from(state.days)
                };
                
                localStorage.setItem('vacationExpenseTracker', JSON.stringify(stateToSave));
            }

            // Reset all data
            function resetData() {
                if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
                    state = {
                        budget: 0,
                        tripDuration: 0,
                        expenses: [],
                        days: new Set()
                    };
                    
                    localStorage.removeItem('vacationExpenseTracker');
                    
                    updateDashboard();
                    renderExpenses();
                    updateDayFilter();
                    updateStats();
                    renderCategoryChart();
                    
                    showNotification('All data has been reset! 🔄', 'success');
                }
            }

            // Toggle user menu
            userProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });

            // Close user menu when clicking outside
            document.addEventListener('click', function() {
                userMenu.classList.remove('active');
            });

            // Reset data
            resetDataBtn.addEventListener('click', resetData);

            // Open budget modal
            setBudgetBtn.addEventListener('click', function() {
                budgetModal.classList.add('active');
                document.getElementById('budget-amount').value = state.budget;
                document.getElementById('trip-duration').value = state.tripDuration;
            });

            // Open expense modal
            addExpenseBtn.addEventListener('click', function() {
                expenseModal.classList.add('active');
            });

            // Open export modal
            exportDataBtn.addEventListener('click', function() {
                exportModal.classList.add('active');
            });

            // Close modals
            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    expenseModal.classList.remove('active');
                    budgetModal.classList.remove('active');
                    exportModal.classList.remove('active');
                });
            });

            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
                if (event.target === expenseModal) {
                    expenseModal.classList.remove('active');
                }
                if (event.target === budgetModal) {
                    budgetModal.classList.remove('active');
                }
                if (event.target === exportModal) {
                    exportModal.classList.remove('active');
                }
            });

            // Set budget
            budgetForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const budgetAmount = parseFloat(document.getElementById('budget-amount').value);
                const tripDuration = parseInt(document.getElementById('trip-duration').value);
                
                state.budget = budgetAmount;
                state.tripDuration = tripDuration;
                
                updateDashboard();
                updateStats();
                saveData();
                budgetModal.classList.remove('active');
                
                // Show success notification
                showNotification('Budget updated successfully! 💰', 'success');
            });

            // Add expense
            expenseForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('expense-name').value;
                const amount = parseFloat(document.getElementById('expense-amount').value);
                const category = document.getElementById('expense-category').value;
                const day = parseInt(document.getElementById('expense-day').value);
                const notes = document.getElementById('expense-notes').value;
                
                const newExpense = {
                    id: Date.now(),
                    name,
                    amount,
                    category,
                    day,
                    notes,
                    date: new Date().toISOString()
                };
                
                state.expenses.push(newExpense);
                state.days.add(day);
                
                updateDashboard();
                renderExpenses();
                updateDayFilter();
                updateStats();
                renderCategoryChart();
                saveData();
                
                expenseForm.reset();
                expenseModal.classList.remove('active');
                
                // Show success notification
                showNotification('Expense added successfully! ✅', 'success');
            });

            // Export data as CSV
            exportCsvBtn.addEventListener('click', function() {
                const headers = ['Name', 'Amount', 'Category', 'Day', 'Notes', 'Date'];
                let csvContent = headers.join(',') + '\n';
                
                state.expenses.forEach(expense => {
                    const row = [
                        `"${expense.name}"`,
                        expense.amount,
                        expense.category,
                        expense.day,
                        `"${expense.notes}"`,
                        new Date(expense.date).toLocaleDateString()
                    ];
                    csvContent += row.join(',') + '\n';
                });
                
                downloadFile(csvContent, 'vacation-expenses.csv', 'text/csv');
                exportModal.classList.remove('active');
                showNotification('Data exported as CSV! 📄', 'success');
            });

            // Export data as JSON
            exportJsonBtn.addEventListener('click', function() {
                const dataToExport = {
                    budget: state.budget,
                    tripDuration: state.tripDuration,
                    expenses: state.expenses,
                    exportDate: new Date().toISOString()
                };
                
                const jsonContent = JSON.stringify(dataToExport, null, 2);
                downloadFile(jsonContent, 'vacation-expenses.json', 'application/json');
                exportModal.classList.remove('active');
                showNotification('Data exported as JSON! 📊', 'success');
            });

            // Helper function to download file
            function downloadFile(content, fileName, contentType) {
                const a = document.createElement('a');
                const file = new Blob([content], { type: contentType });
                a.href = URL.createObjectURL(file);
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(a.href);
            }

            // Filter expenses
            categoryFilter.addEventListener('change', renderExpenses);
            dayFilter.addEventListener('change', renderExpenses);
            sortFilter.addEventListener('change', renderExpenses);

            // Update dashboard numbers
            function updateDashboard() {
                const totalExpenses = state.expenses.reduce((total, expense) => total + expense.amount, 0);
                const savings = state.budget - totalExpenses;
                
                totalBudgetEl.textContent = formatCurrency(state.budget);
                totalExpensesEl.textContent = formatCurrency(totalExpenses);
                savingsEl.textContent = formatCurrency(savings);
                
                // Change color based on savings
                if (savings < 0) {
                    savingsEl.style.color = 'var(--danger-color)';
                } else {
                    savingsEl.style.color = 'var(--secondary-color)';
                }
            }

            // Update day filter options
            function updateDayFilter() {
                // Clear existing options except "All Days"
                while (dayFilter.options.length > 1) {
                    dayFilter.remove(1);
                }
                
                // Add day options
                const sortedDays = Array.from(state.days).sort((a, b) => a - b);
                sortedDays.forEach(day => {
                    const option = document.createElement('option');
                    option.value = day;
                    option.textContent = `📅 Day ${day}`;
                    dayFilter.appendChild(option);
                });
            }

            // Get emoji for category
            function getCategoryEmoji(category) {
                switch(category) {
                    case 'accommodation': return '🏨';
                    case 'food': return '🍽️';
                    case 'transportation': return '🚗';
                    case 'activities': return '🎡';
                    case 'shopping': return '🛍️';
                    case 'entertainment': return '🎭';
                    case 'other': return '📦';
                    default: return '📝';
                }
            }

            // Render expenses list
            function renderExpenses() {
                const selectedCategory = categoryFilter.value;
                const selectedDay = dayFilter.value;
                const sortOption = sortFilter.value;
                
                // Filter expenses
                let filteredExpenses = state.expenses;
                
                if (selectedCategory !== 'all') {
                    filteredExpenses = filteredExpenses.filter(expense => expense.category === selectedCategory);
                }
                
                if (selectedDay !== 'all') {
                    filteredExpenses = filteredExpenses.filter(expense => expense.day === parseInt(selectedDay));
                }
                
                // Sort expenses
                switch (sortOption) {
                    case 'day-asc':
                        filteredExpenses.sort((a, b) => a.day - b.day);
                        break;
                    case 'day-desc':
                        filteredExpenses.sort((a, b) => b.day - a.day);
                        break;
                    case 'amount-asc':
                        filteredExpenses.sort((a, b) => a.amount - b.amount);
                        break;
                    case 'amount-desc':
                        filteredExpenses.sort((a, b) => b.amount - a.amount);
                        break;
                    case 'name-asc':
                        filteredExpenses.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                    case 'name-desc':
                        filteredExpenses.sort((a, b) => b.name.localeCompare(a.name));
                        break;
                }
                
                // Clear list
                expenseList.innerHTML = '';
                
                // Show empty state if no expenses
                if (filteredExpenses.length === 0) {
                    const emptyState = document.createElement('li');
                    emptyState.className = 'empty-state';
                    emptyState.textContent = 'No expenses found 🔍 Try a different filter!';
                    expenseList.appendChild(emptyState);
                    return;
                }
                
                // Render expenses
                filteredExpenses.forEach((expense, index) => {
                    const li = document.createElement('li');
                    li.className = 'expense-item';
                    li.style.animationDelay = `${index * 0.05}s`;
                    li.innerHTML = `
                        <div class="expense-details">
                            <h3>${expense.name}</h3>
                            <div class="expense-meta">
                                <span>📅 Day ${expense.day}</span>
                                <span class="category-badge category-${expense.category}">${getCategoryEmoji(expense.category)} ${formatCategory(expense.category)}</span>
                                ${expense.notes ? `<span title="${expense.notes}">📝</span>` : ''}
                            </div>
                        </div>
                        <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                        <div>
                            <button class="action-btn edit-btn" data-id="${expense.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="action-btn delete-btn" data-id="${expense.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    `;
                    expenseList.appendChild(li);
                });
                
                // Add delete event listeners
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        deleteExpense(id);
                    });
                });
                
                // Add edit event listeners
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        editExpense(id);
                    });
                });
            }

            // Delete expense
            function deleteExpense(id) {
                state.expenses = state.expenses.filter(expense => expense.id !== id);
                
                // Recalculate days
                state.days = new Set(state.expenses.map(expense => expense.day));
                
                updateDashboard();
                renderExpenses();
                updateDayFilter();
                updateStats();
                renderCategoryChart();
                saveData();
                
                // Show notification
                showNotification('Expense deleted successfully! 🗑️', 'success');
            }

            // Edit expense
            function editExpense(id) {
                const expense = state.expenses.find(e => e.id === id);
                if (!expense) return;
                
                // Fill form with expense data
                document.getElementById('expense-name').value = expense.name;
                document.getElementById('expense-amount').value = expense.amount;
                document.getElementById('expense-category').value = expense.category;
                document.getElementById('expense-day').value = expense.day;
                document.getElementById('expense-notes').value = expense.notes || '';
                
                // Change form submit behavior
                const form = document.getElementById('expense-form');
                const originalSubmitHandler = form.onsubmit;
                
                form.onsubmit = function(e) {
                    e.preventDefault();
                    
                    // Update expense
                    expense.name = document.getElementById('expense-name').value;
                    expense.amount = parseFloat(document.getElementById('expense-amount').value);
                    expense.category = document.getElementById('expense-category').value;
                    expense.day = parseInt(document.getElementById('expense-day').value);
                    expense.notes = document.getElementById('expense-notes').value;
                    
                    // Update days set
                    state.days = new Set(state.expenses.map(e => e.day));
                    
                    // Update UI
                    updateDashboard();
                    renderExpenses();
                    updateDayFilter();
                    updateStats();
                    renderCategoryChart();
                    saveData();
                    
                    // Reset form and close modal
                    form.reset();
                    expenseModal.classList.remove('active');
                    
                    // Restore original submit handler
                    form.onsubmit = originalSubmitHandler;
                    
                    // Show notification
                    showNotification('Expense updated successfully! ✏️', 'success');
                };
                
                // Open modal
                expenseModal.classList.add('active');
            }

            // Update statistics
            function updateStats() {
                if (state.expenses.length === 0) {
                    avgDailyExpenseEl.textContent = formatCurrency(0);
                    highestExpenseEl.textContent = formatCurrency(0);
                    totalDaysEl.textContent = state.tripDuration || 0;
                    mostExpensiveCategoryEl.textContent = 'None';
                    return;
                }
                
                // Calculate average daily expense
                const totalExpenses = state.expenses.reduce((total, expense) => total + expense.amount, 0);
                const uniqueDays = state.days.size;
                const avgDailyExpense = uniqueDays > 0 ? totalExpenses / uniqueDays : 0;
                
                // Find highest expense
                const highestExpense = Math.max(...state.expenses.map(expense => expense.amount));
                
                // Find most expensive category
                const categoryTotals = {};
                state.expenses.forEach(expense => {
                    if (!categoryTotals[expense.category]) {
                        categoryTotals[expense.category] = 0;
                    }
                    categoryTotals[expense.category] += expense.amount;
                });
                
                let mostExpensiveCategory = 'None';
                let highestCategoryTotal = 0;
                
                for (const category in categoryTotals) {
                    if (categoryTotals[category] > highestCategoryTotal) {
                        highestCategoryTotal = categoryTotals[category];
                        mostExpensiveCategory = `${getCategoryEmoji(category)} ${formatCategory(category)}`;
                    }
                }
                
                // Update UI
                avgDailyExpenseEl.textContent = formatCurrency(avgDailyExpense);
                highestExpenseEl.textContent = formatCurrency(highestExpense);
                totalDaysEl.textContent = state.tripDuration || uniqueDays;
                mostExpensiveCategoryEl.textContent = mostExpensiveCategory;
            }

            // Render category chart
            function renderCategoryChart() {
                // Clear chart
                categoryChart.innerHTML = '';
                
                if (state.expenses.length === 0) {
                    return;
                }
                
                // Calculate category totals
                const categoryTotals = {};
                state.expenses.forEach(expense => {
                    if (!categoryTotals[expense.category]) {
                        categoryTotals[expense.category] = 0;
                    }
                    categoryTotals[expense.category] += expense.amount;
                });
                
                // Find highest total for scaling
                const highestTotal = Math.max(...Object.values(categoryTotals));
                
                // Create bars
                Object.entries(categoryTotals).forEach(([category, total], index) => {
                    const height = (total / highestTotal) * 100;
                    
                    const bar = document.createElement('div');
                    bar.className = 'chart-bar';
                    bar.style.height = `${height}%`;
                    bar.style.animationDelay = `${index * 0.1}s`;
                    
                    const label = document.createElement('div');
                    label.className = 'chart-bar-label';
                    label.textContent = `${getCategoryEmoji(category)} ${formatCategory(category)}`;
                    
                    const value = document.createElement('div');
                    value.className = 'chart-bar-value';
                    value.textContent = formatCurrency(total);
                    
                    bar.appendChild(label);
                    bar.appendChild(value);
                    categoryChart.appendChild(bar);
                });
            }

            // Show notification
            function showNotification(message, type = 'info') {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.textContent = message;
                
                // Style the notification
                Object.assign(notification.style, {
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    color: 'white',
                    zIndex: '9999',
                    animation: 'slideInRight 0.3s, fadeOut 0.5s 2.5s forwards'
                });
                
                // Set background color based on type
                if (type === 'success') {
                    notification.style.backgroundColor = 'var(--success-color)';
                } else if (type === 'error') {
                    notification.style.backgroundColor = 'var(--danger-color)';
                } else if (type === 'warning') {
                    notification.style.backgroundColor = 'var(--warning-color)';
                } else {
                    notification.style.backgroundColor = 'var(--primary-color)';
                }
                
                document.body.appendChild(notification);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }

            // Format currency
            function formatCurrency(amount) {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(amount);
            }

            // Format category
            function formatCategory(category) {
                return category.charAt(0).toUpperCase() + category.slice(1);
            }

            // Initialize app
            createCubes();
            handleScrollReveal();
            handleParallax();
            loadData();
            
            // Add scroll event listeners
            window.addEventListener('scroll', handleScrollReveal);
            window.addEventListener('scroll', updateScrollProgress);
            
            // Initial scroll progress update
            updateScrollProgress();
            
            // Add some sample data if no data exists
            if (state.expenses.length === 0) {
                // Show welcome notification
                setTimeout(() => {
                    showNotification('Welcome to Vacation Expense Tracker! 🏝️ Start by setting your budget.', 'info');
                }, 1000);
            }
        });